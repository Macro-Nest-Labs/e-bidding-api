const CopyPlugin = require("copy-webpack-plugin");

var path = require("path");
var nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  target: "node",
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()],
  devtool: "inline-source-map",
  entry: "./src/app.ts",
  output: { path: path.resolve(__dirname, "dist"), filename: "app.js" },
  resolve: {
    extensions: [".jsx", ".js", ".ts", ".tsx"],
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: [/node_modules/, /lib/],
      },
      {
        test: /\.graphql$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/email-templates", to: "email-templates" }],
    }),
  ],
};
