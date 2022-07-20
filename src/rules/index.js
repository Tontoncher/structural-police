const noDefaultExport = require('./noDefaultExport');
const importPermissionSchema = require('./importPermissionSchema');

module.exports = {
    'no-default-export': {
        create: noDefaultExport,
    },
    'import-permission-schema': {
        create: importPermissionSchema,
    },
};
