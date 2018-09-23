const CopyWebpackPlugin = require('copy-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/main.js',

  output: {
    path: `${__dirname}/dist/js`,
    filename: 'bundle.js'
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/mathjax', to: `${__dirname}/dist/js/mathjax` },
      { from: 'manifest.json', to: `${__dirname}/dist/manifest.json` }
    ])
  ],

  devtool: production ? false : 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  }
};
