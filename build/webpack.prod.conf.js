/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackBaseConfig = require('./webpack.base.conf.js');


module.exports = merge(webpackBaseConfig, {
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Ray Player Demo Page',
      template: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: path.posix.join('static', 'css/[name].css'),
      chunkFilename: path.posix.join('static', 'css/[id].css'),
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: 'static',
      },
    ]),
  ],

  module: {
    rules: [{
      test: /\.css$/i,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
      ],
    }],
  },

  devtool: 'source-map',

  mode: 'production',
});
