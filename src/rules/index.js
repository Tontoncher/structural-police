import { noDefaultExport } from './noDefaultExport';
import { importPermissionSchema } from './importPermissionSchema';

export const rules = {
    'no-default-export': {
        create: noDefaultExport,
    },
    'import-permission-schema': {
        create: importPermissionSchema,
    },
};
