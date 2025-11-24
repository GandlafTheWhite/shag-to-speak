import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ModeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRegister: () => void;
  onSelectLogin: () => void;
}

const ModeSelectionDialog = ({ 
  open, 
  onOpenChange, 
  onSelectRegister, 
  onSelectLogin 
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
        <div className="flex flex-col gap-3 mt-4">
          <Button
            size="lg"
            className="w-full text-lg py-6"
            onClick={onSelectRegister}
          >
            <Icon name="UserPlus" size={20} className="mr-2" />
            Регистрация
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg py-6"
            onClick={onSelectLogin}
          >
            <Icon name="LogIn" size={20} className="mr-2" />
            Вход
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeSelectionDialog;
