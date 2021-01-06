const path = require('path')
const { HotModuleReplacementPlugin, EnvironmentPlugin } = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkerPlugin = require('worker-plugin')
const Dotenv = require('dotenv-webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CopyPlugin = require('copy-webpack-plugin')

// Files in the `/public` directory that will be copied to `/dist during build
const includedFiles = [
  'favicon-light.ico',
  'favicon-dark.ico',
  'stackoverflow-light.css',
  'stackoverflow-dark.css'
]

module.exports = env => {
  const plugins = [
    new Dotenv(),
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
    new CopyPlugin(
      includedFiles.map(filename => ({
        from: path.resolve(__dirname, 'public', filename),
        to: path.resolve(__dirname, 'dist')
      }))
    ),
    new EnvironmentPlugin({
      DEBUG: JSON.parse(env.debug)
    }),
    new WorkerPlugin({
      // Use "self" as the global object when receiving hot updates
      // during debug but disable warnings about hot module reload
      // when building for production
      globalObject: env.debug ? 'self' : false
    })
  ]

  if (env.analyze) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return {
    plugins: plugins,
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
          test: /\.(ttf|png|jpg|svg|ico)$/,
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
