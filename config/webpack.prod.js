const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

const paths = require('./paths');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    path: paths.build,
    publicPath: '/',
    filename: 'js/[name].[contenthash].bundle.js',
  },
  module: {
    rules: [
      // Add image-webpack-loader
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: false,
              mozjpeg: {
                progressive: true,
                quality: 75,
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: false,
              modules: false,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    // Extracts CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.src + '/images',
          to: 'assets/images',
          transform(content, absoluteFrom) {
            return (async () => {
              if (Buffer.isBuffer(content)) {
                const imagemin = await import('imagemin');
                const imageminJpegtran = await import('imagemin-jpegtran');
                const imageminPngquant = await import('imagemin-pngquant');
                const imageminGifsicle = await import('imagemin-gifsicle');
                const imageminSvgo = await import('imagemin-svgo');
                
                const imageminOptions = {
                  plugins: [
                    imageminJpegtran.default({ progressive: true }),
                    imageminPngquant.default({ quality: [0.5, 0.8] }),
                    imageminGifsicle.default({
                      interlaced: true,
                      optimizationLevel: 3,
                      colors: 128, // Reduce the number of colors in the image. It can be between 2 and 256.
                      lossy: 50, // Set the compression level to lossless (0) or lossy (100).
                    }),
                    imageminSvgo.default({
                      plugins: [
                        { name: 'removeViewBox', active: true },
                        { name: 'removeDimensions', active: true },
                        { name: 'removeComments', active: true },
                        { name: 'removeMetadata', active: true },
                        { name: 'removeTitle', active: true },
                        { name: 'removeDesc', active: true },
                        { name: 'removeUselessDefs', active: true },
                        { name: 'removeEmptyText', active: true },
                        { name: 'removeEditorsNSData', active: true },
                        { name: 'removeEmptyAttrs', active: true },
                        { name: 'removeEmptyContainers', active: true },
                        { name: 'cleanupEnableBackground', active: true },
                        { name: 'convertStyleToAttrs', active: true },
                        { name: 'convertColors', active: true },
                        { name: 'convertTransform', active: true },
                        { name: 'removeNonInheritableGroupAttrs', active: true },
                        { name: 'removeUselessStrokeAndFill', active: true },
                        { name: 'removeUnusedNS', active: true },
                        { name: 'cleanupIDs', active: true },
                        { name: 'cleanupNumericValues', active: true },
                        { name: 'moveElemsAttrsToGroup', active: true },
                        { name: 'moveGroupAttrsToElems', active: true },
                        { name: 'collapseGroups', active: true },
                        { name: 'removeRasterImages', active: true },
                        { name: 'convertShapeToPath', active: true },
                        { name: 'sortAttrs', active: true },
                        { name: 'removeOffCanvasPaths', active: true },
                        { name: 'removeHiddenElems', active: false }, // try turn on this rules those rules could broke 
                        { name: 'convertPathData', active: false }, // the build depends on svg files
                        { name: 'removeUnknownsAndDefaults', active: false },
                        { name: 'mergePaths', active: false },
                        { name: 'removeXMLNS', active: false },
                      ],
                    }),
                  ],
                };
                return imagemin.default.buffer(content, imageminOptions);
              }
              return content;
            })();
          },
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), '...'],
    runtimeChunk: {
      name: 'runtime',
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
