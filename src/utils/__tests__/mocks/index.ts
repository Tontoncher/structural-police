const __any__ = true;

export const schema = {
    __rules__: {
        rulesNumber: 1,
    },
    src: {
        pages: {
            __var__pageName: {
                model: { __any__ },
                ui: {},
            },
        },
        features: {
            someFeature: {
                __rules__: {
                    rulesNumber: 2,
                },
            }
        },
    },
    autotests: {},
};