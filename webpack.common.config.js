const path = require("path");
const webpack = require("webpack");

const phaserModule = path.dirname(require.resolve("phaser"));
const phaser = path.join(phaserModule, "custom/phaser-split.js");
const pixi = path.join(phaserModule, "custom/pixi.js");
const p2 = require.resolve("p2");
const VisibilityPolygon = require.resolve("./src/client/vendor/visibility_polygon_dev");

const PATHS = {
    app: path.join(__dirname, "src", "client"),
    build: path.join(__dirname, "lib", "js")
};

const config = {
    entry: {
        index: [PATHS.app],
        vendor: [
            "pixi",
            "p2",
            "phaser",
            "exdat",
            "visibility-polygon",
            "clipper-js"
        ]
    },
    resolve: {
        extensions: ["", ".js"],
        alias: {
            "phaser": phaser,
            "pixi": pixi,
            "p2": p2,
            "visibility-polygon": VisibilityPolygon
        }
    },
    output: {
        path: PATHS.build,
        filename: "[name].js",
        publicPath: "/js/"
    },
    module: {
        preLoaders: [],

        loaders: [
            { test: /\.json/, loader: "json" },
            { test: /pixi\.js$/, loader: "expose?PIXI" },
            { test: /phaser-split\.js$/, loader: "expose?Phaser" },
            { test: /p2\.js$/, loader: "expose?p2" },
            { test: /visibility-polygon\.js$/, loader: "expose?VisibilityPolygon" },
            {
                test: /.js$/,
                loader: "transform/cacheable?brfs",
                include: path.dirname(require.resolve("exdat"))
            },
            {
                test: /.js$/,
                include: PATHS.app,
                loaders: ["babel-loader?cacheDirectory"]
            }
        ],

        postLoaders: []
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js")
    ]
};


module.exports = {
    PATHS: PATHS,
    config: config
};
