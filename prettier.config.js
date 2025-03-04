/** @type {import("prettier").Config} */
export default {
    tabWidth: 4,
    singleQuote: true,
    bracketSpacing: false,
    printWidth: 120,
    overrides: [
        {
            files: ['*.json', '*.yml', '*.yaml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
