import { getGroupsWithImports, errorCheck, getCommentsRange, replaceBackSlash, groupsToFlat } from '../utils';
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
                const { orderErrors, blankLineErrors, groupsNameError } =  errorCheck(groupsWithImports, sourceCode, blankLineAfterEveryGroup, groupNamePrefix, oldGroupNamePrefix );

                if (orderErrors) {
                    for (let error of orderErrors) {
                        context.report({
                            node: error.node,
                            message: errorMessages.mustBeAfter({
                                importPath: error.import.importPath,
                                mustBeAfterImportPath: error.mustBeAfter.importPath,
                            }),
                            suggest: [
                                {
                                    desc: 'Move import',
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
                                },
                            ],
                            *fix(fixer) {
                                let rightImportsBlock = [];

                                for (const currentImport of groupsToFlat(groupsWithImports)) {
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
                                }
                                yield fixer.insertTextBeforeRange([0, 0], rightImportsBlock.join(''));
                            },
                        });
                    }
                }

                if (blankLineErrors && !orderErrors) {
                    for (let error of blankLineErrors) {
                        context.report({
                            node: error.node,
                            message: (() => {
                                switch (true) {
                                    case error.needAddBlankLineAfter:
                                        return errorMessages.blankLineDetected({
                                            importPath: error.importPath,
                                            groupName: error.groupName,
                                        });
                                    case error.needDeleteBlankLineAfter:
                                        return errorMessages.blankLineExpected({
                                            importPath: error.importPath,
                                            groupName: error.groupName,
                                        });
                                    default:
                                        return 'Some blank line problem';
                                }
                            })(),
                            suggest: [
                                {
                                    desc: 'Fix a blank line error',
                                    *fix(fixer) {
                                        const nextSymbolRange = [error.node.range[1], error.node.range[1] + 1];

                                        if (error.needAddBlankLineAfter) {
                                            yield fixer.insertTextAfterRange(nextSymbolRange, '\n');
                                        }

                                        if (error.needDeleteBlankLineAfter) {
                                            yield fixer.removeRange(nextSymbolRange);
                                        }
                                    },
                                },
                            ],
                            *fix(fixer) {
                                const nextSymbolRange = [error.node.range[1], error.node.range[1] + 1];

                                if (error.needAddBlankLineAfter) {
                                    yield fixer.insertTextAfterRange(nextSymbolRange, '\n');
                                }

                                if (error.needDeleteBlankLineAfter) {
                                    yield fixer.removeRange(nextSymbolRange);
                                }
                            },
                        });
                    }
                }

                if (groupsNameError && !orderErrors) {
                    for (let error of groupsNameError) {
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
                            suggest: [
                                {
                                    desc: 'Fix a groups name error',
                                    *fix(fixer) {
                                        if (error.needAddCommentBefore) {
                                            yield fixer.insertTextBeforeRange(error.range, `${error.newCommentText}\n`);
                                        }

                                        if (error.needDeleteComment) {
                                            const removingRange = [error.comment.range[0], error.comment.range[1] + 1];

                                            yield fixer.removeRange(removingRange);
                                        }
                                    },
                                },
                            ],
                            *fix(fixer) {
                                if (error.needAddCommentBefore) {
                                    yield fixer.insertTextBeforeRange(error.range, `${error.newCommentText}\n`);
                                }

                                if (error.needDeleteComment) {
                                    const removingRange = [error.comment.range[0], error.comment.range[1] + 1];

                                    yield fixer.removeRange(removingRange);
                                }
                            },
                        });
                    }
                }
            }
        },
    };
};