import { noDefaultExport } from './noDefaultExport';
import { importPermissionSchema } from './importPermissionSchema';
import { importOrder } from './importOrder';

export const rules = {
    'no-default-export': {
        create: noDefaultExport,
    },
    'import-permission-schema': {
        create: importPermissionSchema,
    },
    'import-order': {
        create: importOrder,
        meta: { fixable: true, hasSuggestions: true },
    },
};
