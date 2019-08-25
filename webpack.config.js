// @ts-nocheck
/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new Dotenv({ systemvars: true }),
    new webpack.DefinePlugin({
      APP_BUILD: JSON.stringify(Date.now()),
    }),
  ],
  target: 'node',
  externals: [nodeExternals()],
};
