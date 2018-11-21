module.exports = {
    "env": {
        "amd": true,
        "browser": true,
        "es6": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
        "ecmaVersion": 2018,
        "sourceType": "module",
    },
    "rules": {
        "react/prop-types": "off",
        "array-bracket-newline": "off",
        "array-bracket-spacing": [
            "error",
            "never",
        ],
        "arrow-spacing": "error",
        "brace-style": "error",
        "capitalized-comments": [
            "warn",
            "never",
            {
                "line": {
                },
                "block": {
                    "ignorePattern": ".*",
                },
            },
        ],
        "comma-dangle": [
            "error",
            "always-multiline",
        ],
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true,
            },
        ],
        "comma-style": [
            "error",
            "last",
        ],
        "curly": "error",
        "default-case": "warn",
        "dot-notation": "warn",
        "eol-last": [
            "error",
            "always"
        ],
        "eqeqeq": "error",
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            },
        ],
        "key-spacing": [
            "error",
            {
                "beforeColon": false,
                "afterColon": true,
                "mode": "strict",
            },
        ],
        "keyword-spacing": [
            "error",
            {
                "before": true,
                "after": true,
            },
        ],
        "linebreak-style": [
            "error",
            "unix",
        ],
        "line-comment-position": [
            "warn",
            {
                "position": "above",
                "ignorePattern": "else",
            },
        ],
        "jsx-quotes": [
            "error",
            "prefer-double",
        ],
        "max-statements-per-line": [
            "warn",
            {
                "max": 1,
            }
        ],
        "new-parens": "warn",
        "no-array-constructor": "warn",
        "no-console": [
            "warn",
            {
                allow: [
                    "warn",
                    "error",
                ],
            },
        ],
        "no-extra-label": "error",
        "no-extra-parens": [
            "error",
            "functions",
        ],
        "no-extra-semi": "error",
        "no-label-var": "error",
        "no-lonely-if": "error",
        "no-multiple-empty-lines": [
            "error",
            {
                "max": 1,
            },
        ],
        "no-multi-spaces": "error",
        "no-restricted-syntax": [
            "error",
            "SequenceExpression",
        ],
        "no-trailing-spaces": "error",
        "no-unused-expressions": [
            "error", {
                "allowShortCircuit": true,
                "allowTaggedTemplates": true,
                "allowTernary": true,
            }
        ],
        "no-use-before-define": [
            "warn",
            {
                "functions": false,
                "classes": true,
                "variables": true,
            },
        ],
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-whitespace-before-property": "error",
        "object-curly-spacing": [
            "error",
            "never",
        ],
        "object-property-newline": [
            "off",
            {
                "allowAllPropertiesOnSameLine": true,
            }
        ],
        "prefer-template": "error",
        "quote-props": [
            "error",
            "always",
        ],
        "quotes": [
            "error",
            "double",
        ],
        "require-jsdoc": "warn",
        "semi": [
            "error",
            "always",
        ],
        "semi-spacing": [
            "error",
            {
                "before": false,
                "after": true,
            },
        ],
        "semi-style": [
            "error",
            "last",
        ],
        "space-before-blocks": "error",
        "space-before-function-paren": [
            "error",
            "never",
        ],
        "spaced-comment": [
            "warn",
            "always"
        ],
        "space-infix-ops": [
            "warn",
            {
                "int32Hint": false,
            },
        ],
        "space-unary-ops": "error",
        "valid-jsdoc": [
            "warn",
            {
                "requireReturn": false,
            },
        ],
    }
};
