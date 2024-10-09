const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
entry: './src/index.js',
mode: 'development',
devServer: {
    static: "./public",
    hot: true,
},
output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
},
plugins: [
    new Dotenv()
]
};