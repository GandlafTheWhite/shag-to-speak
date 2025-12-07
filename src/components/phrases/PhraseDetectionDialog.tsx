import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PhraseDetectionDialogProps {
  phrases: string[];
  isOpen: boolean;
  onMoveToPhrasesSection: () => void;
  onCancel: () => void;
}

const PhraseDetectionDialog = ({ 
  phrases, 
  isOpen, 
  onMoveToPhrasesSection, 
  onCancel 
}: PhraseDetectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="AlertCircle" size={24} className="text-amber-500" />
            Обнаружена фраза
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Вы ввели целое предложение или фразу:
          </p>
          
          <div className="bg-muted p-3 rounded-lg">
            {phrases.map((phrase, idx) => (
              <div key={idx} className="flex items-start gap-2 py-1">
                <Icon name="MessageSquare" size={16} className="text-primary mt-1 flex-shrink-0" />
                <span className="font-medium">{phrase}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <Icon name="Info" size={14} className="inline mr-1" />
              Упражнения работают только с отдельными словами. Фразы сохраняются в отдельном разделе для справки.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onMoveToPhrasesSection} className="w-full">
            <Icon name="ArrowRight" size={16} className="mr-2" />
            Переместить в раздел "Фразы"
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhraseDetectionDialog;
