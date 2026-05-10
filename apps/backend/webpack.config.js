const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

function createWebpackConfig(options) {
  return {
    ...options,
    mode: 'production',
    output: {
      ...options.output,
      path: path.resolve(__dirname, '../../dist/apps/backend'),
    },
    externals: [
      nodeExternals({
        allowlist: [/^@vibe\/shared/],
        additionalModuleDirs: [path.resolve(__dirname, '../../node_modules')],
      }),
    ],
    plugins: [
      ...(options.plugins || []),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            'pg',
            'sqlite3',
            'tedious',
            'pg-query-stream',
            'oracledb',
            'mysql',
            'better-sqlite3',
            'libsql',
            '@libsql/client',
            'mariadb',
            'mssql',
            'mysql2',
            'pg-native',
            'hdb-pool',
            'mysql',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource, { paths: [process.cwd()] });
            return false;
          } catch (err) {
            return true;
          }
        },
      }),
    ],
    optimization: {
      minimize: true,
      nodeEnv: 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
            keep_fnames: true,
          },
        }),
      ],
    },
  };
}
module.exports = createWebpackConfig;
