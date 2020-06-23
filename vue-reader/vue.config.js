
module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  pwa: {
    name: 'Manga Reader',
    themeColor: '#343a40',
    msTileColor: '#343a40',
    manifestPath: 'manifest.json',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'service-worker.ts',
      // ...other Workbox options...
    }
  }
};
