/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');

function resolve(dir) {
  /**
   * __dirname is current directory: /build
   * __dirname join '..' to get root path of project
   * this function return absolute full path of dir
   */
  return path.join(__dirname, '..', dir);
}


module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, '../dist'), // use same output path
    filename: '[name].js', // [name] is placeholder
    // Output folder
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
  externals: {
    jquery: 'jQuery',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // include: [resolve('src'), resolve('node_modules/webpack-dev-server/client')],
        include: [resolve('src')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('static', 'img/[name].[hash:7].[ext]'),
          outputPath: (url) => path.posix.join('', url),
        },
      },
      {
        test: /\.(mp3|m4a|wav|lrc)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('static', 'media/[name].[hash:7].[ext]'),
        },
      },
    ],
  },
};
