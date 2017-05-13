const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/main.js'),
  output: {
    path: path.resolve(__dirname, './build/js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader?mimetype=image/svg+xml'
      },
      {
        test: /\.woff$/,
        loader: 'url-loader?mimetype=application/font-woff'
      },
      {
        test: /\.woff2$/,
        loader: 'url-loader?mimetype=application/font-woff'
      },
      {
        test: /\.eot$/,
        loader: 'url-loader?mimetype=application/font-woff'
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader?mimetype=application/font-woff'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
