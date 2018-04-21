module.exports = {
    dependence: {
        npm: {
            "eslint": "3.19.0",
            "babel-eslint": "7.2.1",
            "eslint-config-airbnb": "14.1.0",
            "eslint-config-vue": "2.0.2",
            "eslint-plugin-import": "2.2.0",
            "eslint-plugin-jsx-a11y": "4.0.0",
            "eslint-plugin-lean-imports": "0.3.3",
            "eslint-plugin-react": "6.10.3",
            "eslint-plugin-vue": "2.0.1",
            "stylelint": "7.12.0",
            "stylelint-config-standard": "16.0.0",
            "stylelint-processor-html": "1.0.0"
        }
    },
    plan: {
        es6: ['.eslintrc_es6.json', '.stylelintrc.json'],
        es5: ['.eslintrc_es5.json', '.stylelintrc.json'],
        node: ['.eslintrc_node.json'],
        vue: ['.eslintrc_vue.json', '.stylelintrc.json'],
        react: ['.eslintrc_react.json', '.stylelintrc.json'],
        default: ['.eslintrc_es6.json', '.stylelintrc.json']
    },
    initHooks: 'update_git_hooks.sh'
}