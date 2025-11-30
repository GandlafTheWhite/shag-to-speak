import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-fade-in">
      {!isOnline ? (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Icon name="WifiOff" size={20} className="text-yellow-600" />
          <AlertDescription className="ml-2 text-yellow-800">
            Вы offline. Изменения синхронизируются при восстановлении связи.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <Icon name="Wifi" size={20} className="text-green-600" />
          <AlertDescription className="ml-2 text-green-800">
            Подключение восстановлено!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OfflineIndicator;
