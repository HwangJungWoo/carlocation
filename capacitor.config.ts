import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'info.jungsoft.mycar',
  appName: '내차위치',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
