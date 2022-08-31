import { rules } from './rules';
import { defaultSchema, featureSlicedSchema } from './schemas';

module.exports = {
    configs: {
        recommended: {
            rules: {
                'structural-police/no-default-export': 1,
                'structural-police/import-permission-schema': [
                    2,
                    { schema: defaultSchema },
                ],
            },
        },
        featureSliced: {
            rules: {
                'structural-police/no-default-export': 1,
                'structural-police/import-permission-schema': [
                    2,
                    { schema: featureSlicedSchema },
                ],
            },
        },
    },
    rules,
};
