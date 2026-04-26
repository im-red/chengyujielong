import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.chengyujielong.app',
    appName: '成语接龙',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: false,
            backgroundColor: "#667eea",
            showSpinner: false,
            androidScaleType: "CENTER_CROP",
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
};

export default config;
