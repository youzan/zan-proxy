const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'

const config = {
  entry: {
    manager: './src/web/manager.js'
  },
  output: {
    path: path.resolve(__dirname, '../proxy/static')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              [
                'env',
                {
                  modules: false,
                  targets: {
                    browsers: ['chrome >= 57', 'firefox >= 52']
                  }
                }
              ],
              'stage-0'
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new HtmlPlugin({
      template: 'src/template.html'
    }),
    new ExtractTextPlugin('style.css')
  ]
}

if (!dev) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()
  )
}

module.exports = config
