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
    rules: [{
      // CSS Files
      test: /\.css$/i,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
      ],
    }, {
      // JS Files
      test: /\.js$/,
      loader: 'babel-loader',
      include: [path.join(__dirname, '..', 'src')],
    }],
  },

  output: {
    filename: 'ray-player.js',
    path: path.resolve(__dirname, '../lib'),
    libraryExport: 'default', // What name you export from entry file
    library: 'RayPlayer', // Variable name on page
  },
};
