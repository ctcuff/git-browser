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
    new Dotenv({
      systemvars: true
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
          test: /\.(ts|js)x?$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader']
        },
        {
          test: /\.(ttf|png|jpg|svg|ico)$/,
          use: ['file-loader']
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    // HACK: wabt.js uses fs from node which isn't available in the browser
    // so it needs to be replaced with an empty object. HOWEVER: this may
    // mean that some functions of the library may not work properly
    // https://v4.webpack.js.org/configuration/node/#node
    // https://github.com/AssemblyScript/wabt.js/issues/21#issuecomment-790203740
    node: {
      fs: 'empty'
    }
  }
}
