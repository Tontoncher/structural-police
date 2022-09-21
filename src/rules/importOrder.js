import {
    getGroupsWithImports,
    errorCheck,
    getCommentsRange,
    replaceBackSlash,
    groupsToFlat,
    getBlankLineCountAfterRange,
} from '../utils';
import { defaultErrorMessages } from '../constants';

export const importOrder = (context) => {
    const projectPath = context.getCwd();
    const filePath = replaceBackSlash(context.getFilename().substr(projectPath.length + 1));
    const sourceCode = context.getSourceCode();
    let {
        groups = [],
        behaviorRelatedComment = 'link',
        blankLineAfterEveryGroup = false,
        customErrorMessages = {},
        groupNamePrefix = ' # ',
        oldGroupNamePrefix,
        withinGroupSort,
        optimizedFix = false,
    } = context.options[0];
    const errorMessages = { ...defaultErrorMessages, ...customErrorMessages };
    let importsArray = [];

    if (!(['link', 'remove'].includes(behaviorRelatedComment))) {
        behaviorRelatedComment = 'link';
    }

    return {
        ImportDeclaration(node) {
            importsArray.push({
                line: node.loc.start.line,
                node: node,
                importPath: node.source.value,
            });
        },
        onCodePathEnd(codePath, node) {
            if (node.type === 'Program') {
                const groupsWithImports = getGroupsWithImports(importsArray, sourceCode, filePath, groups, withinGroupSort, groupNamePrefix);
                const { orderErrors, blankLineErrors, groupsNameError, blankLineCountErrors } = errorCheck(groupsWithImports, sourceCode, blankLineAfterEveryGroup, groupNamePrefix, oldGroupNamePrefix );

                if (optimizedFix && (orderErrors || blankLineErrors || groupsNameError || blankLineCountErrors)) {
                    context.report({
                        loc: { start: { line: 0, column: 0 } },
                        message: 'There are import-order errors in the file',
                        *fix(fixer) {
                            let rightImportsBlock = [];

                            for (const currentImport of groupsToFlat(groupsWithImports)) {
                                const blankLineCount = getBlankLineCountAfterRange(sourceCode, currentImport.node.range);

                                // groupName
                                if (currentImport.isFirstInGroup && currentImport.groupName) {
                                    rightImportsBlock.push(`//${groupNamePrefix}${currentImport.groupName}\n`);
                                }
                                // comments
                                if (currentImport.relatedCommentsText && behaviorRelatedComment === 'link') {
                                    rightImportsBlock.push(`${currentImport.relatedCommentsText}`);
                                }
                                if (currentImport.relatedCommentsRange) {
                                    yield fixer.removeRange([currentImport.relatedCommentsRange[0], currentImport.relatedCommentsRange[1] + 1]);
                                }
                                // import
                                rightImportsBlock.push(`${currentImport.text}\n`);
                                yield fixer.removeRange([currentImport.node.range[0], currentImport.node.range[1] + 1]);
                                // blankLine
                                if (currentImport.isLastInGroup && (currentImport.blankLineAfterGroup || blankLineAfterEveryGroup)) {
                                    rightImportsBlock.push('\n');
                                }
                                if (blankLineCount > 0) {
                                    const wrongBlankLineRange = [currentImport.node.range[1] + 1, currentImport.node.range[1] + blankLineCount + 1];
                                    yield fixer.removeRange(wrongBlankLineRange);
                                }
                            }

                            yield fixer.insertTextBeforeRange([0, 0], rightImportsBlock.join(''));
                        },
                    });
                }

                if (orderErrors) {
                    for (let error of orderErrors) {
                        let fixObject = {
                            *fix(fixer) {
                                const errorImportRange = [error.node.range[0], error.node.range[1] + 1];
                                const mustBeAfterRange = [...error.mustBeAfter.node.range];
                                const errorImport = sourceCode.getText(error.node);
                                const relatedComments = sourceCode.getCommentsBefore(error.node);

                                if (relatedComments.length > 0) {
                                    const commentsRange = getCommentsRange(relatedComments);

                                    if (behaviorRelatedComment === 'link') {
                                        const comments = sourceCode.getText({ range: commentsRange });
                                        yield fixer.insertTextAfterRange(mustBeAfterRange, `\n${comments}`);
                                    }

                                    yield fixer.removeRange([commentsRange[0], commentsRange[1] + 1]);
                                }

                                yield fixer.removeRange(errorImportRange);
                                yield fixer.insertTextAfterRange(mustBeAfterRange, `\n${errorImport}`);
                            },
                        };
                        if (optimizedFix) {
                            fixObject = { suggest: [{
                                    desc: 'Move this import',
                                    ...fixObject,
                                }],
                            };
                        }

                        context.report({
                            loc: error.loc,
                            message: errorMessages.mustBeAfter({
                                importPath: error.import.importPath,
                                mustBeAfterImportPath: error.mustBeAfter.importPath,
                            }),
                            ...fixObject,
                        });
                    }
                }

                if (blankLineErrors) {
                    for (let error of blankLineErrors) {
                        let fixObject = {
                            *fix(fixer) {
                                const nextSymbolRange = [error.node.range[1], error.node.range[1] + 1];

                                if (error.needAddBlankLineAfter) {
                                    yield fixer.insertTextAfterRange(nextSymbolRange, '\n');
                                }

                                if (error.needDeleteBlankLineAfter) {
                                    yield fixer.removeRange(nextSymbolRange);
                                }
                            },
                        };
                        if (optimizedFix) {
                            fixObject = { suggest: [{
                                    desc: `${error.needAddBlankLineAfter ? 'Add blank line' : ''}${error.needDeleteBlankLineAfter ? 'Remove blank line' : ''}`,
                                    ...fixObject,
                                }],
                            };
                        }

                        context.report({
                            loc: error.loc,
                            message: (() => {
                                switch (true) {
                                    case error.needAddBlankLineAfter:
                                        return errorMessages.blankLineExpected({
                                            importPath: error.importPath,
                                            groupName: error.groupName,
                                        });
                                    case error.needDeleteBlankLineAfter:
                                        return errorMessages.blankLineDetected({
                                            importPath: error.importPath,
                                            groupName: error.groupName,
                                        });
                                    default:
                                        return 'Some blank line problem';
                                }
                            })(),
                            ...fixObject,
                        });
                    }
                }

                if (groupsNameError) {
                    for (let error of groupsNameError) {
                        let fixObject = {
                            *fix(fixer) {
                                if (error.needAddCommentBefore) {
                                    yield fixer.insertTextBeforeRange(error.range, `${error.newCommentText}\n`);
                                }

                                if (error.needDeleteComment) {
                                    const removingRange = [error.comment.range[0], error.comment.range[1] + 1];

                                    yield fixer.removeRange(removingRange);
                                }
                            },
                        };
                        if (optimizedFix) {
                            fixObject = { suggest: [{
                                    desc: `${error.needAddCommentBefore ? 'Add correct groups name' : ''}${error.needDeleteComment ? 'Remove wrong groups name' : ''}`,
                                    ...fixObject,
                                }],
                            };
                        }

                        context.report({
                            loc: error.loc,
                            message: (() => {
                                switch (true) {
                                    case error.needAddCommentBefore:
                                        return errorMessages.needAddComment({
                                            groupName: error.groupName,
                                            newComment: error.newCommentText,
                                        });
                                    case error.needDeleteComment:
                                        return errorMessages.needRemoveComment();
                                    default:
                                        return 'Some group name problem';
                                }
                            })(),
                            ...fixObject,
                        });
                    }
                }

                if (blankLineCountErrors) {
                    for (let error of blankLineCountErrors) {
                        let fixObject = {
                            *fix(fixer) {
                                const wrongBlankLineRange = [error.range[1], error.range[1] + error.count - 1];
                                yield fixer.removeRange(wrongBlankLineRange);
                            },
                        };
                        if (optimizedFix) {
                            fixObject = { suggest: [{
                                    desc: error.count > 2 ? `Remove ${error.count - 1} blank lines` : 'Remove blank line',
                                    ...fixObject,
                                }],
                            };
                        }

                        context.report({
                            loc: error.loc,
                            message: 'So many blank line after import',
                            ...fixObject,
                        });
                    }
                }
            }
        },
    };
};