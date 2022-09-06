import {
    findNodesRulesByPath,
    isLocalPath,
    getAbsPath,
    checkImportPermission,
    startsWithOneOf,
    replaceBackSlash,
} from '../utils';
import { defaultErrorMessages } from '../constants';

export const importPermissionSchema = (context) => {
    const projectPath = context.getCwd();
    const filePath = replaceBackSlash(context.getFilename().substr(projectPath.length + 1));
    const {
        schema = {},
        inheritance = true,
        entryPoints = ['./'],
        everywhereAllowed = [],
        customErrorMessages = {},
    } = context.options[0];

    if (!startsWithOneOf(filePath, entryPoints) && !entryPoints.includes('./')) {
        return {};
    }

    const errorMessages = { ...defaultErrorMessages, ...customErrorMessages };
    const nodesRules = findNodesRulesByPath(filePath, schema, inheritance, errorMessages);
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
            const importPath = node.source.value;

            if (!isFileError) {
                if (isLocalPath(importPath, entryPoints)) {
                    const permission = checkImportPermission(
                        getAbsPath(filePath, importPath),
                        fileRules
                    );

                    if (!permission) {
                        context.report({
                            node,
                            message: errorMessages.importDisallow({
                                filePath,
                                importPath,
                                absoluteImportPath: getAbsPath(
                                    filePath,
                                    importPath
                                ),
                            }),
                        });
                    }
                }
            }
        },
    };
};
