'use strict';

const path = require('path');
const basePath = __dirname;
const NODE_MODULE_PATH = path.join(basePath, 'node_modules');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const fs = require('fs');
const _ = require('lodash');

const WEBPACK_MODE = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = WEBPACK_MODE === 'production';
const SETTINGS_PATH = process.env.SETTINGS_PATH || './settings.js';
const SETTINGS_LOCAL_PATH = process.env.SETTINGS_LOCAL_PATH || './settings-local.js';
const ANALYZE=!!process.env.ANALYZE;
const THREADS = getThreadLoaderThreads();

const copyWebpackPluginPaths = _.without(fs.readdirSync('node_modules/@spinnaker'), 'package.json', 'styleguide', 'node_modules')
  .map(x => `node_modules/@spinnaker/${x}/lib`);

if (!fs.existsSync(SETTINGS_LOCAL_PATH)) {
  const contents = `/*
  Provides a hook for mutating settings.js, primarily for users of Halyard.

  e.g.,
  window.spinnakerSettings.defaultInstancePort = 8080;
*/
`;
  fs.writeFileSync(SETTINGS_LOCAL_PATH, contents);
}

const config = {
  context: __dirname,
  mode: WEBPACK_MODE,
  entry: {
    settings: SETTINGS_PATH,
    'settings-local': SETTINGS_LOCAL_PATH,
    app: './src/app.ts',
  },
  output: {
    path: path.join(__dirname, 'build', 'webpack', process.env.SPINNAKER_ENV || ''),
  },
   // eval in dev env (faster compilations)
  devtool: IS_PRODUCTION ? 'source-map' : 'eval',
  optimization: {
    splitChunks: { chunks: 'all' },
    minimize: false
  },
  devServer: {
    disableHostCheck: true,
    port: process.env.DECK_PORT || 9000,
    host: process.env.DECK_HOST || 'localhost',
    https: process.env.DECK_HTTPS === 'true',
    stats: 'errors-only',
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.less', '.html'],
    modules: [
      NODE_MODULE_PATH,
      path.resolve(__dirname, 'src'),
    ],
    alias: {
      root: __dirname,
      // coreImports: path.resolve(NODE_MODULE_PATH, '@spinnaker', 'core', 'src', 'presentation', 'less', 'imports', 'commonImports.less'),
      // coreColors: path.resolve(NODE_MODULE_PATH, '@spinnaker', 'core', 'src', 'presentation', 'less', 'imports', 'colors.less'),
    }
  },
  watch:  process.env.WATCH === 'true',
  module: {
    rules: [
      {
        test: /settings\.js/,
        use: [{ loader: 'envify-loader' }],
      },
      {
        test: /\.js$/,
        use: [
          // { loader: 'cache-loader', options: { cacheIdentifier: CACHE_INVALIDATE } },
          { loader: 'thread-loader', options: { workers: THREADS } },
          { loader: 'babel-loader' },
          { loader: 'eslint-loader' },
        ],
        exclude: /(node_modules(?!\/clipboard)|settings\.js)/,
      },
      {
        test: /\.tsx?$/,
        use: [
          // { loader: 'cache-loader', options: { cacheIdentifier: CACHE_INVALIDATE } },
          { loader: 'thread-loader', options: { workers: THREADS } },
          { loader: 'ts-loader', options: { happyPackMode: true } },
          { loader: 'tslint-loader' },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          {loader: 'style-loader'}, // creates style nodes from JS strings
          {loader: 'css-loader'},   // translates CSS into CommonJS
          {loader: 'sass-loader',
            options: {includePaths: [require('path').resolve(__dirname, 'node_modules')]}
          } // compiles Sass to CSS
        ]
      },
      {
        test: /\.(jpg)$/,
        use: [
          {loader: 'file-loader', options: {name: '[name].[hash:5].[ext]'}},
        ],
      },
      {
        test: /\.(woff|woff2|otf|ttf|eot|png|gif|ico|svg)(.*)?$/,
        use: [{ loader: 'file-loader', options: { name: '[name].[hash:5].[ext]' } }],
      },
      {
        test: require.resolve('jquery'),
        use: [
          'expose-loader?$',
          'expose-loader?jQuery'
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /ui-sortable/,
        use: ['imports-loader?$UI=jquery-ui/ui/widgets/sortable'],
      },
      {
        test: /\.html$/,
        include: [path.resolve(__dirname, 'src', 'spinnaker.modules')],
        use: [{ loader: 'ngtemplate-loader?relativeTo=' + path.resolve(__dirname, 'src') + '/' }, { loader: 'html-loader' }],
      },
      {
        test: /\.html$/,
        include: [
          path.resolve(NODE_MODULE_PATH, '@spinnaker', 'kayenta')
        ],
        use: [
          { loader: 'ngtemplate-loader?relativeTo=' + (path.resolve(NODE_MODULE_PATH, '@spinnaker', 'kayenta', 'src')) + '&prefix=kayenta' },
          { loader: 'html-loader' }
        ],
      }
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new HtmlWebpackPlugin({
      title: 'Spinnaker',
      template: './src/index.deck',
      favicon: 'src/favicon.ico',
      inject: true,

      // default order is based on webpack's compile process
      // with the migration to webpack two, we need this or
      // settings.js is put at the end of the <script> blocks
      // which breaks the booting of the app.
      chunksSortMode: (a, b) => {
        const chunks = ['manifest', 'init', 'vendor', 'halconfig', 'settings', 'settings-local', 'spinnaker', 'app'];
        return chunks.indexOf(a.names[0]) - chunks.indexOf(b.names[0]);
      }
    }),
    new CopyWebpackPlugin(
        copyWebpackPluginPaths,
      {copyUnmodified: false, ignore: ['*.js', '*.ts', '*.map', 'index.html']}
    ),
  ],
};

if (ANALYZE) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

// For now, investigate source map and minification compatibility with Kayenta
// if (IS_PRODUCTION) {
//   config.optimization.minimize = true;
//   config.optimization.minimizer = [
//     new UglifyJsPlugin({
//       // test: /\.ts?$/,
//       // sourceMap: true,
//     })
//   ];
// }

if (IS_PRODUCTION) {
  // Before fingerprinting settings.js, we need to address the dynamic
  // name in yaml-tools/deckArtifacts - see entrypoint.sh in this repo.
  config.output.filename = function (bundle) {
    if (bundle.chunk.name === 'settings') {
      return 'settings.js';
    } else if (bundle.chunk.name === 'settings-local') {
      return 'settings-local.js';
    }
    return `${bundle.chunk.name}.${bundle.hash.substring(0, 5)}.js`;
  }
} else {
  // Also webpack-dev-server doesn't like filename option as a function - seems like a bug
  // TODO: investigate when fixed if issue
  config.output.filename = '[name].js';
}

// invalidate webpack cache when webpack config is changed or cache-loader is updated,
// function getCacheInvalidateString() {
//   return JSON.stringify({
//     CACHE_LOADER: require('cache-loader/package.json').version,
//     WEBPACK_CONFIG: md5(fs.readFileSync(__filename)),
//   });
// }

// When running locally, use one less than the physical number of cpus
// When running on travis, use max of 2 threads
// https://docs.travis-ci.com/user/reference/overview/#Virtualization-environments
function getThreadLoaderThreads() {
  const bareMetalThreads = Math.max(require('physical-cpu-count') - 1, 1);
  const travisThreads = Math.min(require('physical-cpu-count'), 2);
  const autoThreads = !!process.env.TRAVIS ? travisThreads : bareMetalThreads;
  const threads = process.env.THREADS || autoThreads;

  console.log(
    `INFO: cpus: ${
      require('os').cpus().length
    } physical: ${require('physical-cpu-count')} thread-loader threads: ${threads}`,
  );

  return threads;
}

module.exports = config;
