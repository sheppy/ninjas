const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.config");

module.exports = merge(common.config, {
    production: true,
    debug: false,

    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        })
    ]
});
