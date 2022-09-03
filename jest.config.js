module.exports = {
    testPathIgnorePatterns: [
        'src/utils/__tests__/mocks',
    ],
    collectCoverage: true,
    coverageThreshold: {
        global: {
            functions: 50,
            lines: 50,
            statements: 50,
        },
        'src/utils/': {
            functions: 100,
            lines: 100,
            // statements: 100,
        },
    },
};