import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';


interface ModeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRegister: () => void;
  onSelectLogin: () => void;
  onTelegramAuth: () => void;
}

const ModeSelectionDialog = ({ 
  open, 
  onOpenChange, 
  onSelectRegister, 
  onSelectLogin,
  onTelegramAuth
}: ModeSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">Начать изучение</DialogTitle>
          <DialogDescription className="text-center">
            Выберите действие
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Zap" size={20} className="text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">Быстрая регистрация/вход</span>
              </div>
              <p className="text-sm text-muted-foreground">Вход в один клик через Telegram</p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={onTelegramAuth}
            >
              <Icon name="Send" size={20} className="mr-2" />
              Войти через Telegram
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Или</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-lg py-6"
            onClick={onSelectRegister}
          >
            <Icon name="UserPlus" size={20} className="mr-2" />
            Регистрация через Email
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg py-6"
            onClick={onSelectLogin}
          >
            <Icon name="LogIn" size={20} className="mr-2" />
            Вход через Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeSelectionDialog;