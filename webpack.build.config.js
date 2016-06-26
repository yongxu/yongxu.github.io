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
        loader: "url?limit=10000&mimetype=image/svg+xml"
      }, {
        test: /\.gif$/,
        loader: "url-loader?limit=10000&mimetype=image/gif"
      }, {
        test: /\.jpg$/,
        loader: "url-loader?limit=10000&mimetype=image/jpg"
      }, {
        test: /\.png$/,
        loader: "url-loader?limit=10000&mimetype=image/png"
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
