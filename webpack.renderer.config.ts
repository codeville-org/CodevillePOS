import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import type { Configuration } from "webpack";

import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

const assets = ["images"];

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "postcss-loader" }
  ]
});

export const rendererConfig: Configuration = {
  module: {
    rules
  },
  plugins: [
    ...plugins,
    ...assets.map((asset) => {
      return new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src/assets", asset),
            to: path.resolve(__dirname, ".webpack/renderer", asset)
          }
        ]
      });
    })
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
};
