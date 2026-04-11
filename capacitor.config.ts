import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.chengyujielong.app',
    appName: 'Chengyu Jielong',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: "#667eea",
            showSpinner: false,
            androidScaleType: "CENTER_CROP",
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
};

export default config;
