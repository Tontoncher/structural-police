export const checkCompeteMatch = (node, path) => {
    return path in node;
};
export const checkIncludesVar = (node, path) => {
    for (const key in node) {
        if (key.startsWith('__var__')) {
            return { key, value: path };
        }
    }
    return false;
};
export const checkIncludesAny = (node) => {
    return !!node.__any__;
};
export const startsWithOneOf = (str = '', array = []) => {
    for (const item of array) {
        if (str.startsWith(item)) {
            return true;
        }
    }
    return false;
};

export const findNodesRulesByPath = (path, schema, inheritance) => {
    const successfulPartsPathArray = [];
    const nodeVariables = {};
    let inheritedRules = null;
    let includesRules = null;
    let node = schema;
    let error = null;

    const rewriteRules = (rules) => {
        if (includesRules) {
            inheritedRules = includesRules;
        }

        includesRules = rules || null;
    };
    const getIncludesRules = (node) => {
        return '__rules__' in node ? { ...node.__rules__ } : null;
    };
    const goDeeperIntoSchema = (partPath) => {
        successfulPartsPathArray.push(partPath);
        node = node[partPath];
    };
    const runParsingPath = (path) => {
        const partsPathArray = path.split('/');

        for (const pathItem of partsPathArray) {
            if (checkCompeteMatch(node, pathItem)) {
                goDeeperIntoSchema(pathItem);
                rewriteRules(getIncludesRules(node));
                continue;
            }

            const includesVar = checkIncludesVar(node, pathItem);
            if (includesVar) {
                nodeVariables[includesVar.key] = includesVar.value;
                goDeeperIntoSchema(includesVar.key);
                rewriteRules(getIncludesRules(node));
                continue;
            }

            if (checkIncludesAny(node)) {
                break;
            }

            error = `The file is not described in the schema. In "${
                successfulPartsPathArray.length === 0
                    ? 'root'
                    : successfulPartsPathArray.join('/')
            }" expected a node "${pathItem}"`;

            break;
        }
    };

    rewriteRules(getIncludesRules(node));
    runParsingPath(path);

    if (error) {
        return {
            error,
        };
    }

    const rules = inheritance ? includesRules || inheritedRules : includesRules;

    if (!rules) {
        return {
            error: `There is no set of rules in the "${successfulPartsPathArray.join('/')}"`,
        };
    }

    return {
        error: false,
        value: {
            ...rules,
            variables: nodeVariables,
        },
    };
};
export const isLocalPath = (str, entryPoints = []) => {
    const startLocalStr = ['.', ...entryPoints];

    return startsWithOneOf(str, startLocalStr);
};
export const getAbsPath = (filePath, importPath) => {
    if (!isLocalPath(importPath)) {
        return importPath;
    }

    const arrFile = filePath.split('/');
    const arrPath = importPath.split('/');
    arrFile.pop();
    if (arrPath[0] === '.') {
        arrPath.shift();
    }

    while (arrPath[0] === '..') {
        arrFile.pop();
        arrPath.shift();
    }

    return [...arrFile, ...arrPath].join('/');
};
export const replaceVariables = (arrStr, variables) =>
    arrStr.map((item) => {
        if (item.includes('__var__')) {
            for (const variableName in variables) {
                const variable = variables[variableName];
                item = item.replace(new RegExp(`${variableName}`, 'g'), variable);
            }
        }
        return item;
    });
export const checkImportPermission = (
    path,
    {
        defaultAllowed = false,
        allowed = [],
        disallowed = [],
        variables,
        everywhereAllowed = [],
    }
) => {
    if (defaultAllowed) {
        const replacedDisallowed = replaceVariables(disallowed, variables);
        return (
            !startsWithOneOf(path, replacedDisallowed) || startsWithOneOf(path, everywhereAllowed)
        );
    }

    const replacedAllowed = replaceVariables(allowed, variables);
    return startsWithOneOf(path, replacedAllowed) || startsWithOneOf(path, everywhereAllowed);
};
