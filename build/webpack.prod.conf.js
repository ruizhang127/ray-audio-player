/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackBaseConfig = require('./webpack.base.conf.js');

module.exports = merge(webpackBaseConfig, {
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Ray Player Demo Page',
      template: 'demo.html',
      filename: 'demo.html',
    }),
  ],

  devtool: 'source-map',

  mode: 'production',
});
