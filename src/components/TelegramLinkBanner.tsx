import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import TelegramLoginButton from './TelegramLoginButton';
import { apiClient } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/pages/Index';

interface TelegramLinkBannerProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

const TelegramLinkBanner = ({ user, onUpdate }: TelegramLinkBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('telegram_link_dismissed') === 'true';
  });
  const { toast } = useToast();

  if (user.telegram_id || dismissed) {
    return null;
  }

  const handleTelegramLink = async (telegramUser: any) => {
    try {
      const result = await apiClient.telegramLinkAccount(telegramUser);
      onUpdate({ telegram_id: result.telegram_id });
      setShowDialog(false);
      toast({
        title: 'Telegram привязан! 🎉',
        description: 'Теперь вы можете восстановить пароль через Telegram бота'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось привязать Telegram',
        variant: 'destructive'
      });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('telegram_link_dismissed', 'true');
  };

  return (
    <>
      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <Icon name="Shield" size={20} className="text-primary" />
        <AlertTitle className="flex items-center justify-between">
          <span>Защитите свой аккаунт</span>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Привяжите Telegram, чтобы не потерять доступ к своим словам. С привязкой вы сможете:
          </p>
          <ul className="space-y-1 mb-3 text-sm">
            <li className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-green-500" />
              Восстановить пароль через бота
            </li>
            <li className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-green-500" />
              Войти одной кнопкой без пароля
            </li>
            <li className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-green-500" />
              Получать уведомления о прогрессе
            </li>
          </ul>
          <Button onClick={() => setShowDialog(true)} size="sm">
            <Icon name="Link" size={16} className="mr-2" />
            Привязать Telegram
          </Button>
        </AlertDescription>
      </Alert>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Привязать Telegram</DialogTitle>
            <DialogDescription>
              Нажмите кнопку ниже для привязки вашего Telegram аккаунта
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-accent/50 rounded-lg space-y-2">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p>
                    После привязки вы сможете восстанавливать пароль через Telegram бота.
                  </p>
                  <p>
                    Для активации восстановления напишите боту{' '}
                    <a
                      href="https://t.me/ShagToSpeakBot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      @ShagToSpeakBot
                    </a>
                    {' '}команду <code className="bg-muted px-1 rounded">/start</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <TelegramLoginButton
                botName="ShagToSpeakBot"
                onAuth={handleTelegramLink}
                buttonSize="large"
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TelegramLinkBanner;
