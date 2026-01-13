import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malawi_insight.app',
  appName: 'MIDS',
  webDir: 'build/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;
