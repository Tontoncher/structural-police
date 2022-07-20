const rules = require('./rules');
const schema = require('./defaultSchema');

module.exports = {
    configs: {
        recommended: {
            rules: {
                'structural-police/no-default-export': 1,
                'structural-police/import-permission-schema': [
                    2,
                    { schema, inheritance: true, entryPoints: ['apps'] },
                ],
            },
        },
    },
    rules,
};
