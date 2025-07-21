const path = require('path');

module.exports = {
  entry: './src/extension-actions/background.ts',
  output: {
    filename: 'background.js',
    path: path.resolve(__dirname, 'dist/lingua-go/browser/extension-actions'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  mode: 'development'
};
