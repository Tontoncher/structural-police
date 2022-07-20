const __any__ = true;

module.exports = {
    apps: {
        __var__appName: {
            __rules__: {
                defaultAllowed: false,
                allowed: ['apps/__var__appName'],
            },
            src: {
                app: {
                    bundles: {
                        __rules__: {
                            defaultAllowed: false,
                            allowed: ['apps/__var__appName'],
                        },
                        __any__,
                    },
                },
                pages: {
                    __var__pageName: {
                        __rules__: {
                            defaultAllowed: false,
                            allowed: [
                                'apps/__var__appName/src/pages/__var__pageName',
                                'apps/__var__appName/src/features',
                                'apps/__var__appName/src/shared',
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
                                'apps/__var__appName/src/features/__var__featureName',
                                'apps/__var__appName/src/shared',
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
                        allowed: ['apps/__var__appName/src/shared'],
                    },
                    __any__,
                },
                autotests: {
                    __rules__: {
                        defaultAllowed: true,
                    },
                    __any__,
                },
            },
            'index.ts': { __any__ },
        },
    },
};
