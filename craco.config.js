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

      // Ignore source map warnings from face-api.js and critical dependency warnings from ffmpeg
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) => {
          if (
            (warning.message.includes('Failed to parse source map') &&
              warning.module.resource.includes('face-api.js')) ||
            (warning.message.includes('Critical dependency: the request of a dependency is an expression') &&
              (warning.module.resource.includes('@ffmpeg/ffmpeg/dist/esm/classes.js') ||
                warning.module.resource.includes('@ffmpeg/ffmpeg/dist/esm/worker.js')))
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
