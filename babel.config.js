module.exports = function (api) {
    api.cache(false);
    const presets = [
            [
                "@babel/preset-env", {
                    "useBuiltIns": "entry",
                    "corejs": {
                        "version": 3,
                        "proposals": true
                    },
                    "targets": {
                        "browsers": ["> 0.25%, not dead"]
                    }
                }
            ]
        ],
        plugins = [
            "@babel/plugin-syntax-dynamic-import"
        ];

    return {
        presets,
        plugins
    };
};
