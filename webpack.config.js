const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['expo-router']
    }
  }, argv);

  // Use our custom HTML template
  config.plugins[0].options.template = path.resolve(__dirname, 'app/web/index.html');

  // Modify the output to target our app-container div
  config.output.publicPath = '/';

  // Modify devServer for development
  if (config.devServer) {
    config.devServer.historyApiFallback = true;
  }
  
  // Inject our CSS file
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  });

  // Copy static assets
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'app/web/styles.css'),
          to: path.resolve(config.output.path, 'styles.css'),
        },
      ],
    })
  );

  // Add fallbacks for Node.js modules
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      'fs': false,
      'path': false,
      'os': require.resolve('os-browserify/browser'),
    }
  };

  // Polyfill for AsyncStorage in SSR
  config.plugins.push(
    new config.webpack.DefinePlugin({
      'typeof window': JSON.stringify('object'),
    })
  );

  return config;
}; 