export const APP_VERSION = '1.0.3';

export function checkAndMigrateVersion(): boolean {
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion !== APP_VERSION) {
    console.log(`[App] Version mismatch: ${storedVersion} -> ${APP_VERSION}. Starting migration...`);
    
    const userId = localStorage.getItem('shagtospeak_user');
    const authToken = localStorage.getItem('auth_token');
    
    localStorage.clear();
    
    if (userId) localStorage.setItem('shagtospeak_user', userId);
    if (authToken) localStorage.setItem('auth_token', authToken);
    
    localStorage.setItem('app_version', APP_VERSION);
    
    if ('serviceWorker' in navigator) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log(`[App] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[App] All caches cleared');
      });
      
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
    }
    
    return true;
  }
  
  return false;
}