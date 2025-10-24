module.exports = {
  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) => {
          if (
            (warning.message.includes('Failed to parse source map') &&
              warning.module.resource.includes('face-api.js'))
          ) {
            return true; // Ignore this specific warning
          }
          return false; // Keep other warnings
        },
      ];

      return webpackConfig;
    },
  },
};
