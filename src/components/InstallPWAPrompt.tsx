import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    const hasSeenPrompt = localStorage.getItem('pwa_prompt_dismissed');
    
    if (isInStandaloneMode || hasSeenPrompt) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (isIOSDevice && !isInStandaloneMode && !hasSeenPrompt) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Download" size={24} className="text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl mb-1 break-words">
                Установите приложение
              </CardTitle>
              <CardDescription className="text-sm break-words">
                {isIOS 
                  ? 'Добавьте ShagToSpeak на главный экран для быстрого доступа'
                  : 'Установите ShagToSpeak для удобного доступа без браузера'
                }
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="flex-shrink-0"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium flex items-center gap-2">
              <Icon name="Info" size={16} className="text-primary flex-shrink-0" />
              <span>Как установить на iPhone/iPad:</span>
            </p>
            <ol className="space-y-2 pl-6 list-decimal text-muted-foreground">
              <li className="break-words">Нажмите кнопку "Поделиться" <Icon name="Share" size={14} className="inline" /> внизу экрана Safari</li>
              <li className="break-words">Прокрутите вниз и выберите "На экран Домой"</li>
              <li className="break-words">Нажмите "Добавить" в правом верхнем углу</li>
            </ol>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              Понятно
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleInstallClick}
              size="default"
              className="flex-1 sm:flex-initial"
              disabled={!deferredPrompt}
            >
              <Icon name="Download" size={18} className="mr-2" />
              Установить
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="default"
              className="flex-1 sm:flex-initial"
            >
              Позже
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstallPWAPrompt;
