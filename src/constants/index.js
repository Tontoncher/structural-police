export const defaultErrorMessages = {
    importDisallow: ({ absoluteImportPath }) => `Not allowed to import from "${absoluteImportPath}"`,
    missingFile: ({ schemaPath, missingNode }) => `The file is not described in the schema. In "${schemaPath}" expected a node "${missingNode}"`,
    missingRules: ({ schemaPath }) => `There is no set of rules in the "${schemaPath}"`,
};