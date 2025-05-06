import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'http://172.24.176.1:5500/',
  appName: 'liebe',
  webDir: 'dist',
  server: {
    url: 'http://172.24.176.1:5500/',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreKeyPassword: null,
      releaseType: "APK"
    }
  }
};

export default config;