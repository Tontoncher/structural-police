export const defaultErrorMessages = {
    importDisallow: ({ absoluteImportPath }) => `Not allowed to import from "${absoluteImportPath}"`,
    missingFile: ({ schemaPath, missingNode }) => `The file is not described in the schema. In "${schemaPath}" expected a node "${missingNode}"`,
    missingRules: ({ schemaPath }) => `There is no set of rules in the "${schemaPath}"`,

    mustBeAfter: ({ mustBeAfterImportPath }) => `This import must be after import from "${mustBeAfterImportPath}"`,
    blankLineDetected: ({ importPath }) => `Must not be blank line after import from "${importPath}"`,
    blankLineExpected: ({ groupName }) => `Need blank line after imports group "${groupName}"`,
    needAddComment: ({ groupName, newComment }) => `Before imports group "${groupName}" must be comment with groups name "${newComment}"`,
    needRemoveComment: () => 'Need remove wrong groups name',
};