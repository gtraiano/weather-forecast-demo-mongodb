const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || '8080';

const config = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'build.js'
  },
  resolve: {
	alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js']
  },
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [{
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
		        loaders: {
			      }
          }
        }]
      },
	  {
		test: /\.js$/,
		use: [
          { loader: 'babel-loader' },
          { loader: 'imports-loader?define=>false' },
        ]
	  },
	  {
		test: /\.css$/,
		use: [
		  {
		    loader: MiniCssExtractPlugin.loader,
            options: {
		    },
		  },
		  'css-loader',
	    ]
	  },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
			      esModule: false,
            name: '[name].[ext]?[hash]'
          }
        }]
      },
	  {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
           'file-loader',
        ],
      },
    ],
  },
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    openPage: 'http://localhost:8080/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
	    entry: 'index.html',
      template: 'index.html',
      title: 'demo web forecast',
      inject: 'body'
    }),
	  new MiniCssExtractPlugin({filename:"main.css"}),
	  new VueLoaderPlugin(),
    new Dotenv()
  ],
  devtool: '#eval-source-map'
};

module.exports = config;
