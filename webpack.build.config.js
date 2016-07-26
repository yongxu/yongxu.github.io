var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');
var precss       = require('precss');
var postcssImport = require('postcss-import');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    root: path.resolve(__dirname, './src'),
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.resolve(__dirname, './src'),
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      }, {
        test: /\.scss$/,
        loader: "style!css!autoprefixer!sass"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      }, {
        test: /\.(woff|woff2)$/,
        loader: "url?prefix=font/&limit=5000"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml",
        include: path.resolve(__dirname, './assets')
      }, {
        test: /\.gif$/,
        loader: "url-loader?limit=10000&mimetype=image/gif",
        include: path.resolve(__dirname, './assets')
      }, {
        test: /\.jpe?g$/,
        loader: "url-loader?limit=10000&mimetype=image/jpg",
        include: path.resolve(__dirname, './assets')
      }, {
        test: /\.png$/,
        loader: "url-loader?limit=10000&mimetype=image/png",
        include: path.resolve(__dirname, './assets')
      }
    ]
  },
  node: {
    Buffer: false
  },

  postcss: function () {
    return [
      autoprefixer,
      precss,
      postcssImport({
        addDependencyTo: webpack
      })
    ];
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
