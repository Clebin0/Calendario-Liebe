import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovableproject.dateminglemagic',
  appName: 'liebe',
  webDir: 'dist',
  server: {
    url: 'https://hszrxypoyqqzdkunvmjo.lovableproject.com?forceHideBadge=true',
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