import path from 'path';
import { Configuration as WebpackConfiguration, ProvidePlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { ESBuildMinifyPlugin } from 'esbuild-loader';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export default (env: any) => {
  console.log('WEBPACK_SERVE : ', env.WEBPACK_SERVE);

  const config: WebpackConfiguration = {
    name: 'pomerium-swap',
    devtool: env.WEBPACK_SERVE ? 'eval-cheap-module-source-map' : false,
    mode: env.WEBPACK_SERVE ? 'development' : 'production',
    cache: { type: env.WEBPACK_SERVE ? 'memory' : 'filesystem' },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
      alias: {
        '@': [path.resolve(__dirname, 'src')],
      },
    },
    entry: {
      app: './src/App',
    },
    target: ['web', 'es6'],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2015',
          },
        },
        {
          test: /\.css?$/,
          use: [
            'style-loader',
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: false,
              },
            },
            'css-loader',
          ],
        },
        {
          test: /\.(gif|jpg|png|webp|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new ProvidePlugin({
        process: 'process/browser',
        React: 'react',
      }),
      new CopyPlugin({
        patterns: [{ from: 'public', to: './' }],
      }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        minify: {
          collapseWhitespace: true,
        },
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name]-[chunkhash].css',
      }),
    ],
    output: {
      pathinfo: false,
      path: path.join(__dirname, 'build'),
      filename: 'js/[name]-[chunkhash].js',
      assetModuleFilename: 'img/[hash][ext][query]',
      publicPath: '/',
      clean: true,
    },
    devServer: {
      historyApiFallback: true,
      port: 3090,
      static: { directory: path.resolve(__dirname, 'build') },
      hot: true,
      open: true,
    },
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015',
          css: true,
        }),
      ],
    },
    performance: {
      hints: env.WEBPACK_SERVE ? false : 'warning',
      maxAssetSize: 1048576,
      maxEntrypointSize: 1048576,
    },
  };

  if (env.WEBPACK_SERVE && config.plugins) {
    config.plugins.push(new ForkTsCheckerWebpackPlugin());
    config.plugins.push(new ReactRefreshWebpackPlugin());
  }

  if (!env.WEBPACK_SERVE && config.plugins) {
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }));
  }

  return config;
};
