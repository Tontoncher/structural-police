import { defaultErrorMessages } from '../constants';

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

export const findNodesRulesByPath = (path, schema = {}, inheritance = true, errorMessages = defaultErrorMessages) => {
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

            if (!checkIncludesAny(node)) {
                error = errorMessages.missingFile({
                    schemaPath: successfulPartsPathArray.length === 0 ? 'root' : successfulPartsPathArray.join('/'),
                    missingNode: pathItem,
                });
            }

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
            error: errorMessages.missingRules({
                schemaPath: successfulPartsPathArray.join('/'),
            }),
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
    importPath,
    {
        defaultAllowed = false,
        allowed = [],
        disallowed = [],
        variables = {},
        everywhereAllowed = [],
    },
) => {
    if (defaultAllowed) {
        const replacedDisallowed = replaceVariables(disallowed, variables);
        return (
            !startsWithOneOf(importPath, replacedDisallowed) || startsWithOneOf(importPath, everywhereAllowed)
        );
    }

    const replacedAllowed = replaceVariables(allowed, variables);
    return startsWithOneOf(importPath, replacedAllowed) || startsWithOneOf(importPath, everywhereAllowed);
};
export const replaceBackSlash = (str) => {
    return str.replace(/\\/g, '/');
};

export const separateImportsByImportPathMatch = (importsArray, filePath, { importPathMatch, importAbsPathMatch }) => {
    const resolvedImports = [];
    const rejectedImports = [];

    for (const item of importsArray) {
        item.importAbsPath = getAbsPath(filePath, item.importPath);

        const isMatched = (() => {
            switch (true) {
                case (importPathMatch && new RegExp(importPathMatch).test(item.importPath)):
                case (importAbsPathMatch && new RegExp(importAbsPathMatch).test(item.importAbsPath)):
                    return true;
                default:
                    return false;
            }
        })();

        if (isMatched) {
            resolvedImports.push(item);
        } else {
            rejectedImports.push(item);
        }
    }

    return { resolvedImports, rejectedImports };
};
export const getSortedImports = (importsArray, withinGroupSort) => {
    if (withinGroupSort === undefined || !(withinGroupSort instanceof Array)) {
        return importsArray;
    }

    let restImports = [...importsArray].sort((a, b) => {
        return a.importPath > b.importPath ? 1 : -1;
    });
    const groupedImportsArray = [];

    withinGroupSort.forEach((sorter) => {
        const localRestImports = [];
        const regexp = new RegExp(sorter);

        restImports.forEach((importItem) => {
            if (regexp.test(importItem.importPath)) {
                groupedImportsArray.push(importItem);
            } else {
                localRestImports.push(importItem);
            }
        });

        restImports = localRestImports;
    });
    groupedImportsArray.push(...restImports);

    return groupedImportsArray;
};
export const getCommentsRange = (tokensArray = []) => {
    if (tokensArray instanceof Array && tokensArray.length > 0) {
        return [ tokensArray[0].range[0], tokensArray[tokensArray.length-1].range[1] ];
    }

    return undefined;
};
export const getCommentsText = (sourceCode, tokensArray, prefix) => {
    const prefixRegExp = new RegExp(`^//${prefix}`);
    const comments = [];

    for (const currentComment of tokensArray) {
        const currentCommentText = sourceCode.getText(currentComment);

        if (!prefixRegExp.test(currentCommentText)) {
            comments.push(`${currentCommentText}\n`);
        }
    }

    return comments.join('');
};
export const getGroupsWithImports = (importsArray, sourceCode, filePath, groups, withinGroupSort, groupNamePrefix) => {
    const numberedGroups = groups.map((item, i) => (
        {
            ...item,
            number: i,
            imports: [],
            priority: item.priority === undefined ? 1 : item.priority,
        }
    ));
    const prioritySortedGroups = numberedGroups.sort((a, b) => a.priority > b.priority ? -1 : 1);
    let restImports = [...importsArray];

    prioritySortedGroups.forEach(groupsMember => {
        const { resolvedImports, rejectedImports } = separateImportsByImportPathMatch(restImports, filePath, {
            importPathMatch: groupsMember.importPathMatch,
            importAbsPathMatch: groupsMember.importAbsPathMatch,
        });
        groupsMember.imports = getSortedImports(resolvedImports, withinGroupSort);
        restImports = rejectedImports;
    });

    // Если остались не распределенные импорты создаем для них отдельную группу вконце
    if (restImports.length > 0) {
        prioritySortedGroups.push({
            name: '__default__',
            number: prioritySortedGroups.length,
            imports: restImports,
        });
    }

    const numberSortedGroups = prioritySortedGroups.sort((a, b) => a.number < b.number ? -1 : 1);

    numberSortedGroups.forEach((group) => {
        const groupLength = group.imports.length;

        group.imports.forEach((importItem, importIndex) => {
            const relatedComments = sourceCode.getCommentsBefore(importItem.node);
            if (relatedComments.length > 0) {
                importItem.relatedCommentsText = getCommentsText(sourceCode, relatedComments, groupNamePrefix);
                importItem.relatedCommentsRange = getCommentsRange(relatedComments);
            }

            importItem.text = sourceCode.getText(importItem.node);

            if (group.name) {
                importItem.groupName = group.name;
            }
            if (importIndex === 0) {
                importItem.isFirstInGroup = true;
            }
            if ((importIndex === groupLength - 1)) {
                importItem.isLastInGroup = true;
                importItem.blankLineAfterGroup = group.blankLineAfter;
            }
        });
    });

    return numberSortedGroups;
};
export const groupsToFlat = (groups) => {
    let flatImports = [];
    for (const group of groups) {
        flatImports = [...flatImports, ...group.imports];
    }

    return flatImports;
};
export const errorCheck = (groups, sourceCode, blankLineAfterEveryGroup, groupNamePrefix, oldGroupNamePrefix) => {
    const flatImports = groupsToFlat(groups);
    const orderErrorsArray = [];
    const blankLineErrorsArray = [];
    const groupsNameErrorArray = [];

    for (let i = 0; i < flatImports.length; i++) {
        const currentImport = flatImports[i];
        const nextTwoSymbolRange = [currentImport.node.range[1], currentImport.node.range[1] + 2];
        const nextBlankLine = sourceCode.getText({ range: nextTwoSymbolRange }) === '\n\n';
        const needNextBlankLine = currentImport.isLastInGroup && (blankLineAfterEveryGroup || currentImport.blankLineAfterGroup);
        const relatedComments = sourceCode.getCommentsBefore(currentImport.node);
        const rightCommentWithGroupName = currentImport.groupName ? `//${groupNamePrefix}${currentImport.groupName}` : null;
        const needCommentWithGroupName = currentImport.isFirstInGroup && currentImport.groupName;
        let hasRightCommentWithGroupName = false;

        // Проверка на ошибки порядка
        if (i > 0 && flatImports[i-1].line > currentImport.line) {
            orderErrorsArray.push({
                node: currentImport.node,
                import: currentImport,
                mustBeAfter: flatImports[i-1],
            });
        }

        // Проверка на ошибки пустой строки после группы
        if (!needNextBlankLine !== !nextBlankLine) {
            if (needNextBlankLine) {
                blankLineErrorsArray.push({
                    node: currentImport.node,
                    importPath: currentImport.importPath,
                    needAddBlankLineAfter: true,
                    groupName: currentImport.groupName,
                });
            } else {
                blankLineErrorsArray.push({
                    node: currentImport.node,
                    importPath: currentImport.importPath,
                    needDeleteBlankLineAfter: true,
                    groupName: currentImport.groupName,
                });
            }
        }

        // Проверка на ошибки названия группы
        if (relatedComments.length > 0) {
            for (const currentComment of relatedComments) {
                const currentCommentText = sourceCode.getText(currentComment);
                const prefixRegExp = new RegExp(`^//${groupNamePrefix}`);
                const oldPrefixRegExp = new RegExp(`^//${oldGroupNamePrefix}`);

                if (prefixRegExp.test(currentCommentText)) {
                    if (currentCommentText === rightCommentWithGroupName) {
                        hasRightCommentWithGroupName = true;
                    }
                    if (!needCommentWithGroupName || (currentCommentText !== rightCommentWithGroupName)) {
                        groupsNameErrorArray.push({
                            importPath: currentImport.importPath,
                            loc: currentComment.loc,
                            needDeleteComment: true,
                            comment: currentComment,
                        });
                    }
                }
                if (oldGroupNamePrefix && oldPrefixRegExp.test(currentCommentText)) {
                    groupsNameErrorArray.push({
                        importPath: currentImport.importPath,
                        loc: currentComment.loc,
                        needDeleteComment: true,
                        comment: currentComment,
                    });
                }
            }
        }
        if (needCommentWithGroupName && !hasRightCommentWithGroupName) {
            if (relatedComments.length > 0) {
                groupsNameErrorArray.push({
                    loc: relatedComments[0].loc,
                    needAddCommentBefore: true,
                    range: getCommentsRange(relatedComments),
                    groupName: currentImport.groupName,
                    newCommentText: rightCommentWithGroupName,
                });
            } else {
                groupsNameErrorArray.push({
                    loc: currentImport.node.loc,
                    needAddCommentBefore: true,
                    range: currentImport.node.range,
                    groupName: currentImport.groupName,
                    newCommentText: rightCommentWithGroupName,
                });
            }
        }
    }

    return {
        orderErrors: orderErrorsArray.length === 0 ? false : orderErrorsArray,
        blankLineErrors: blankLineErrorsArray.length === 0 ? false : blankLineErrorsArray,
        groupsNameError: groupsNameErrorArray.length === 0 ? false : groupsNameErrorArray,
    };
};
