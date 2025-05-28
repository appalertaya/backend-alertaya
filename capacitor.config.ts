
const config = {
  appId: 'com.alertaya.app',
  appName: 'AlertaYa',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    cleartext: true
  },  
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyCLwen821H_u_cWDcKQvamibkaiEiTUySs',
      forceUseLiteMode: false
    }
  }
};

export default config;
