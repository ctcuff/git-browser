const path = require('path')
const { HotModuleReplacementPlugin, EnvironmentPlugin } = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkerPlugin = require('worker-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = env => {
  return {
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
      }),
      new EnvironmentPlugin({
        DEBUG: JSON.parse(env.debug)
      }),
      new Dotenv(),
      new WorkerPlugin({
        // Use "self" as the global object when receiving hot updates
        // during debug but disable warnings about hot module reload
        // when building for production
        globalObject: env.debug ? 'self' : false
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
          test: /\.(ttf|png|jpg|svg)$/,
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
}
