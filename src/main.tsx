import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import App from './App';
import { idiomLib } from './util/idiomLib';

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
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
}

initCapacitor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
