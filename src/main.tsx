import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from './App';
import { idiomLib } from './idiomLib';
import './styles.css';

console.info('[Main] Starting Chengyu Jielong app');

(window as any).idiomLib = idiomLib;

const isNative = Capacitor.isNativePlatform();

async function initCapacitor() {
    if (!isNative) {
        console.info('Running on web, skipping native-only Capacitor setup.');
        return;
    }

    try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
            await StatusBar.setStyle({ style: Style.Dark });
        }

        console.log('Capacitor initialized successfully');
    } catch (error) {
        console.error('Error initializing Capacitor:', error);
    }
}

async function bootstrap() {
    await initCapacitor();

    const rootElement = document.getElementById('app');

    if (!rootElement) {
        throw new Error('Unable to find root element with id "app"');
    }

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

bootstrap();
