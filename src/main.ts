import { App } from './app';
import { idiomLib } from './idiomLib';
import './styles.css';

console.info('[Main] Starting Chengyu Jielong app');

// Expose idiomLib to window for testing
(window as any).idiomLib = idiomLib;

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
