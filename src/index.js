const rules = require('./rules');
const defaultSchema = require('./schemas/default');
const featureSlicedSchema = require('./schemas/featureSliced');

module.exports = {
    configs: {
        recommended: {
            rules: {
                'structural-police/no-default-export': 1,
                'structural-police/import-permission-schema': [
                    2,
                    { schema: defaultSchema, inheritance: true, entryPoints: ['apps'] },
                ],
            },
        },
        featureSliced: {
            rules: {
                'structural-police/no-default-export': 1,
                'structural-police/import-permission-schema': [
                    2,
                    { schema: featureSlicedSchema, inheritance: true, entryPoints: ['apps'] },
                ],
            },
        },
    },
    rules,
};
