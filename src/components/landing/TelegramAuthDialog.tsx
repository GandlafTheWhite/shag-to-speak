import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface TelegramAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyCode: (code: string) => void;
  isLoading: boolean;
}

const TelegramAuthDialog = ({ open, onOpenChange, onVerifyCode, isLoading }: TelegramAuthDialogProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerifyCode(code.toUpperCase().trim());
  };

  const openTelegramBot = () => {
    window.open('https://t.me/ShagToSpeak_bot?start=auth', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Вход через Telegram
          </DialogTitle>
          <DialogDescription>
            Откройте бота и получите код для входа
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-accent rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                <Icon name="MessageCircle" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Шаг 1: Откройте бота</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Нажмите на кнопку ниже, чтобы открыть бота @ShagToSpeak_bot
                </p>
                <Button 
                  type="button"
                  onClick={openTelegramBot}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Открыть @ShagToSpeak_bot
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t">
              <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                <Icon name="Key" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Шаг 2: Получите код</p>
                <p className="text-xs text-muted-foreground">
                  В боте отправьте команду <code className="bg-background px-1 rounded">/start</code> и получите 6-значный код
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Введите код из бота</Label>
              <Input 
                id="code" 
                type="text" 
                placeholder="ABC123" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Код действителен 10 минут
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || code.length !== 6}>
              {isLoading ? 'Проверка...' : 'Войти'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramAuthDialog;
