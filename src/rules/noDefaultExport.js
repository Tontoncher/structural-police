export const noDefaultExport = (context) => {
    return {
        ExportDefaultDeclaration(node) {
            context.report({ node, message: `Not allowed to use default export` });
        },
    };
};
