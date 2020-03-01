const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {

  mode: 'development',
  devtool: 'source-map',

  entry: {
    app: path.resolve(__dirname, './src/app.js')
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },

  resolve: {
    alias: {
      '@': path.resolve('./src')
    },
    extensions: ['.js', '.css']
  },

  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'index.html'
    }),
    new CleanWebpackPlugin()
  ]

}