import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Correction {
  original: string;
  corrected: string;
}

interface CorrectionConfirmDialogProps {
  corrections: Correction[];
  currentIndex: number;
  onAccept: () => void;
  onReject: () => void;
  isOpen: boolean;
}

const CorrectionConfirmDialog = ({ 
  corrections, 
  currentIndex, 
  onAccept, 
  onReject,
  isOpen 
}: CorrectionConfirmDialogProps) => {
  if (currentIndex >= corrections.length) return null;

  const current = corrections[currentIndex];
  const progress = `${currentIndex + 1}/${corrections.length}`;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="AlertCircle" size={24} className="text-yellow-500" />
            Обнаружена опечатка
          </DialogTitle>
          <DialogDescription>
            {corrections.length > 1 && (
              <span className="text-xs text-muted-foreground">
                {progress}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="font-mono text-red-500 line-through">
              {current.original}
            </span>
            <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            <span className="font-mono text-green-500 font-semibold">
              {current.corrected}
            </span>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Сохранить исправленный вариант?
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onReject}
            className="w-full sm:w-auto"
          >
            <Icon name="X" size={16} className="mr-2" />
            Нет, оставить как есть
          </Button>
          <Button 
            onClick={onAccept}
            className="w-full sm:w-auto"
          >
            <Icon name="Check" size={16} className="mr-2" />
            Да, исправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionConfirmDialog;
