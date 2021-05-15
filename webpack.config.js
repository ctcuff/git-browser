const path = require('path')
const { HotModuleReplacementPlugin, EnvironmentPlugin } = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CopyPlugin = require('copy-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

// Files in the `/public` directory that will be copied to `/dist during build
const includedFiles = [
  'favicon-light.ico',
  'favicon-dark.ico',
  'stackoverflow-light.css',
  'stackoverflow-dark.css'
]

module.exports = env => {
  const plugins = [
    new Dotenv({
      systemvars: true
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx']
    }),
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
    })
  ]

  if (env.analyze) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return {
    plugins,
    mode: 'development',
    entry: path.resolve(__dirname, 'src', 'index.jsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'public'),
      open: false,
      clientLogLevel: 'silent',
      port: 9000,
      host: '0.0.0.0',
      useLocalIp: true,
      hot: true,
      // Allows any url to be visited without throwing a 404 in dev mode
      historyApiFallback: {
        index: '/',
        disableDotRule: true
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx?)$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.(ttf|png|jpg|svg|ico)$/,
          type: 'asset/resource'
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    }
  }
}
