import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malawi_insight.app',
  appName: 'MIDS',
  webDir: 'build/client',
  server: {
    cleartext: true,
    androidScheme: 'http', //'https'
    allowNavigation: ["http://10.0.2.2", "http://10.0.2.2:5023"]
  }
};

export default config;
