const __any__ = true;

export const featureSlicedSchema = {
    __rules__: {
        defaultAllowed: true,
    },
    autotests: { __any__ },
    src: {
        app: {
            bundles: {
                __any__,
            },
        },
        pages: {
            __var__pageName: {
                __rules__: {
                    defaultAllowed: false,
                    allowed: [
                        'src/pages/__var__pageName',
                        'src/features',
                        'src/shared',
                    ],
                },
                model: {
                    constants: { __any__ },
                    configs: { __any__ },
                },
                ui: { __any__ },
                styles: { __any__ },
                'index.tsx': { __any__ },
            },
        },
        features: {
            __var__featureName: {
                __rules__: {
                    defaultAllowed: false,
                    allowed: [
                        'src/features/__var__featureName',
                        'src/shared',
                    ],
                },
                model: { __any__ },
                ui: { __any__ },
                'index.ts': { __any__ },
            },
        },
        shared: {
            __rules__: {
                defaultAllowed: false,
                allowed: ['src/shared'],
            },
            __any__,
        },
    },
    'index.ts': { __any__ },
    'index.js': { __any__ },
};