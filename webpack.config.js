const {CleanWebpackPlugin} = require("clean-webpack-plugin");
module.exports = {
    entry: ['./src/index.js'],
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        chunkFilename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: './node_modules/.cache/babel-loader',
                    }
                },
                exclude: /node_modules/,
            }
        ],
    },
    plugins: [new CleanWebpackPlugin({})],
    watchOptions: {
        ignored: /node_modules/,
    },
}