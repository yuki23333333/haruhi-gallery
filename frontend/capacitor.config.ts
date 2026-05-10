import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.haruhigallery.app',
  appName: 'sos',
  webDir: 'dist',
  server: {
    // 生产环境服务器地址
    url: 'https://yukigallery.fun',
    cleartext: false
  },
  ios: {
    // 配置 iOS 特定设置
    contentInset: 'automatic',
    backgroundColor: '#F2F2F2'
  },
  android: {
    // 配置 Android 特定设置
    backgroundColor: '#F2F2F2',
    allowMixedContent: true,
    captureInput: true
  },
  plugins: {
    // 相机插件配置
    Camera: {
      permissions: ['camera', 'photos']
    },
    // 文件系统插件配置
    FileSystem: {
      permissions: ['write']
    }
  }
};

export default config;
