const {
    findNodesRulesByPath,
    isLocalPath,
    getAbsPath,
    checkImportPermission,
} = require('../utils');

module.exports = (context) => {
    const projectPath = context.getCwd();
    const filePath = context.getFilename().substr(projectPath.length + 1);
    const { schema, inheritance, entryPoints, everywhereAllowed } = context.options[0];
    const nodesRules = findNodesRulesByPath(filePath, schema, inheritance);
    let isFileError = false;
    let fileRules = {};

    if (nodesRules.error) {
        isFileError = true;
    } else {
        fileRules = { everywhereAllowed, ...nodesRules.value };
    }

    return {
        onCodePathStart(codePath, node) {
            if (nodesRules.error) {
                context.report({ node, message: nodesRules.error });
            }
        },
        ImportDeclaration(node) {
            const checkedPath = node.source.value;

            if (!isFileError) {
                if (isLocalPath(checkedPath, entryPoints)) {
                    const permission = checkImportPermission(
                        getAbsPath(filePath, checkedPath),
                        fileRules
                    );

                    if (!permission) {
                        context.report({
                            node,
                            message: `Not allowed to import from "${getAbsPath(
                                filePath,
                                checkedPath
                            )}"`,
                        });
                    }
                }
            }
        },
    };
};
