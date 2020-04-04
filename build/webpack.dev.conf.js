/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 9000;

module.exports = merge(baseWebpackConfig, {
  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    compress: true,
    host: HOST,
    hot: true,
    inline: true,
    open: false,
    overlay: { warnings: false, errors: true },
    port: PORT,
    publicPath: '/',
    // watchContentBase: true,
    watchOptions: {
      poll: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.(mp3||lrc)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('static', 'media/[name].[hash:7].[ext]'),
        },
      },
    ],
  },

  plugins: [
    // TODO: plugins need to learn
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      title: 'Ray Player Demo Page',
      template: 'index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets'),
        to: 'static',
        ignore: ['styles/**/*'],
      },
    ]),
  ],

  devtool: 'cheap-module-source-map',

});
