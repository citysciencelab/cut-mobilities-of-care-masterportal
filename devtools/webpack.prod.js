const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    _ = require("underscore");

module.exports = function (env, args) {
    let path2CustomModule = _.isString(args.CUSTOMMODULE) && args.CUSTOMMODULE !== "" ? args.CUSTOMMODULE : "";

    return merge(new common(path2CustomModule), {
        mode: "production",
        plugins: [
	        new Visualizer({
	            filename: "./prodstatistics.html"
	        })
	    ]
    })
};