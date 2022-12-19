const {join} = require('path');

const rootDir = join(__dirname, '..');
const staticDir = join(rootDir, '.');

module.exports = {
  mode: 'development',
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  devServer: {
    static: {
      directory: join(staticDir, 'docs'),
    },
  },
  output: {
    filename: 'index.js',
    path: join(staticDir, 'docs'),
  },
};
