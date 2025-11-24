import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recoveryStep: 'email' | 'code';
  recoveryEmail: string;
  setRecoveryEmail: (email: string) => void;
  recoveryCode: string;
  setRecoveryCode: (code: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  isLoading: boolean;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onBack: () => void;
}

const ForgotPasswordDialog = ({
  open,
  onOpenChange,
  recoveryStep,
  recoveryEmail,
  setRecoveryEmail,
  recoveryCode,
  setRecoveryCode,
  newPassword,
  setNewPassword,
  isLoading,
  onSendCode,
  onVerifyCode,
  onBack
}: ForgotPasswordDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Восстановление пароля</DialogTitle>
          <DialogDescription>
            {recoveryStep === 'email' 
              ? 'Введите email для получения кода восстановления в Telegram'
              : 'Введите код из Telegram и новый пароль'}
          </DialogDescription>
        </DialogHeader>

        {recoveryStep === 'email' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="email@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <Icon name="Info" size={16} className="inline mr-2" />
              Код придет в личные сообщения Telegram бота
            </div>

            <Button
              onClick={onSendCode}
              className="w-full"
              disabled={isLoading || !recoveryEmail}
            >
              {isLoading ? 'Отправка...' : 'Отправить код'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-code">Код из Telegram</Label>
              <Input
                id="recovery-code"
                type="text"
                placeholder="123456"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Назад
              </Button>
              <Button
                onClick={onVerifyCode}
                className="flex-1"
                disabled={isLoading || !recoveryCode || !newPassword}
              >
                {isLoading ? 'Проверка...' : 'Сбросить пароль'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
