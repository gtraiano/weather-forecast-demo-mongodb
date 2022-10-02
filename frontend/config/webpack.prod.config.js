const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require("terser-webpack-plugin");

console.info('.env path is set to', process.env.ENV_FILE)

const config = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'build.js',
    publicPath: './'
  },
  resolve: {
  	alias: {
        'vue$': 'vue/dist/vue.esm.js'
      },
      extensions: ['.js']
  },
  module: {
    rules: [{
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
		        loaders: {}
          }
        }]
      },
	  {
		test: /\.js$/,
		use: [
          { loader: 'babel-loader' },
          { loader: 'imports-loader?define=>false'},
        ]
	  },
	  {
		test: /\.css$/,
		use: [
		  {
		    loader: MiniCssExtractPlugin.loader,
        options: {},
		  },
		  'css-loader',
	    ]
	  },
    {
      test: /\.s[ac]ss$/i,
      use: [
        // Creates `style` nodes from JS strings
        "style-loader",
        // Translates CSS into CommonJS
        "css-loader",
        // Compiles Sass to CSS
        "sass-loader",
      ],
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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
	    entry: 'index.html',
      baseUrl: '/',
      template: 'index.html',
      title: 'demo weather forecast',
      inject: 'body'
    }),
	  new MiniCssExtractPlugin({ filename: "main.css" }),
	  new VueLoaderPlugin(),
	  new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new Dotenv({ path: path.resolve(__dirname, process.env.ENV_FILE ?? '../../.env') }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
};

module.exports = config;
