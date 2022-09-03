const __any__ = true;

export const schema = {
    __rules__: {
        rulesNumber: 1,
    },
    src: {
        pages: {
            __var__pageName: {
                model: {
                    __rules__: {
                        rulesNumber: 2,
                    },
                    __any__,
                },
                ui: {},
            },
        },
        features: {
            someFeature: {
                __rules__: {
                    rulesNumber: 3,
                },
                model: {},
                ui: { __any__ },
            },
        },
    },
    autotests: {},
};