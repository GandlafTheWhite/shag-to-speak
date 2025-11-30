import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { checkAndMigrateVersion, APP_VERSION } from './version'

console.log(`[App] Starting version ${APP_VERSION}`);

const needsReload = checkAndMigrateVersion();

if (needsReload) {
  console.log('[App] Version updated, reloading...');
  window.location.reload();
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[App] New service worker available, auto-updating...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}