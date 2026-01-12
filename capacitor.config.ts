import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malawi_insight.app',
  appName: 'malawi_insight_app',
  webDir: 'build/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;
