const path = require('path')
const { HotModuleReplacementPlugin } = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  plugins: [
    new HotModuleReplacementPlugin(),
    new MonacoWebpackPlugin({
      features: [
        '!contextmenu',
        '!codeAction',
        '!codelens',
        '!gotoError',
        '!indentation',
        '!parameterHints',
        '!rename',
        '!suggest'
      ]
    }),
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    })
  ],
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    open: false,
    clientLogLevel: 'silent',
    port: 9000,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: 'defaults'
                  }
                ],
                '@babel/preset-react'
              ]
            }
          },
          'eslint-loader'
        ]
      },
      {
        test: /\.(ttf|png|jpg)$/,
        use: ['file-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
}
