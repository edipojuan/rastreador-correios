const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/popup.js',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './../dist')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ]
        }
      }
    }, {
      test: [/.css$|.scss$/],
      use: [
        MiniCssExtractPlugin.loader,
        // 'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'images'
        }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Rastreamento de objetos - Correios',
      template: './src/popup.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: false
      }
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.[chunkhash].css'
    }),
    new CopyPlugin([{
      from: './src/manifest.json',
      to: ''
    }])
  ],
  resolve: {
    extensions: ['.js', '.ts']
  }
};
