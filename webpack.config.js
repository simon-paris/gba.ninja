
var path = require("path");
var webpack = require("webpack");

module.exports = {
    mode: 'development',
    devtool: 'eval',
    entry: {
        app: "./appEntry.js",
        emu: "./emuEntry.js",
        sw: "./sw.js",
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].js",
    },
    module: {
        rules: [
            { 
                test: /\.css$/i, 
                use: ["style-loader", "css-loader"]
            },
        ],
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false
        },
    }
};
