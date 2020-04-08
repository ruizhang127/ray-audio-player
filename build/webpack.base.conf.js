/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');

module.exports = {
  entry: {
    app: './src/index.js',
  },

  resolve: {
    extensions: ['.js', '.json'],
  },

  externals: {
    jquery: 'jQuery',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, '..', 'src')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('static', 'img/[name].[hash:7].[ext]'),
        },
      },
    ],
  },

  output: {
    filename: 'static/js/ray-player.js',
    path: path.resolve(__dirname, '../dist'),
    libraryExport: 'default', // What name you export from entry file
    library: 'RayPlayer', // Variable name on page
  },
};
