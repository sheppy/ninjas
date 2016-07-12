const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.config");

const devServer = {
    contentBase: common.PATHS.build,

    // Enable history API fallback so HTML5 History API based
    // routing works. This is a good default that will come
    // in handy in more complicated setups.
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,

    // Display only errors to reduce the amount of output.
    stats: "errors-only",
    colors: true,

    // Parse host and port from env so this is easy to customize.
    host: process.env.HOST,
    port: process.env.PORT
};

module.exports = merge(common.config, {
    devtool: "cheap-module-inline-source-map",
    devServer: devServer,
    plugins: [
        new webpack.NoErrorsPlugin()
    ]
});
