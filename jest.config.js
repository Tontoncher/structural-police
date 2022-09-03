module.exports = {
    testPathIgnorePatterns: [
        'src/utils/__tests__/mocks',
    ],
    collectCoverage: true,
    coverageThreshold: {
        global: {
            functions: 50,
            lines: 50,
        },
        'src/constants': {
            functions: 100,
            lines: 90,
        },
        'src/utils': {
            functions: 100,
            lines: 90,
        },
    },
};