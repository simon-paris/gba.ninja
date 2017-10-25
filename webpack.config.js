
var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: {
        app: "./appEntry.js",
        emu: "./emuEntry.js",
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].js",
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
        ],
    },
};
