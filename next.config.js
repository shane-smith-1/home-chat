/** @type {import('next').NextConfig} */

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const pdfWorkerPath = require.resolve(
  `pdfjs-dist/build/pdf.worker${
    process.env.NODE_ENV === "development" ? ".min" : ""
  }.js`
);

const nextConfig = {
  // ...
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: pdfWorkerPath,
            to: path.join(__dirname, "public"),
          },
        ],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
