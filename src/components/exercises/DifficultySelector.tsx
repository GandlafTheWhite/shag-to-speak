import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DifficultySelectorProps {
  open: boolean;
  currentDifficulty: string;
  onSelect: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master') => void;
  onClose: () => void;
}

const DIFFICULTY_LEVELS = [
  {
    id: 'beginner' as const,
    label: 'Новичок',
    description: 'A1-A2 • Базовые упражнения',
    icon: 'Sprout',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
  },
  {
    id: 'intermediate' as const,
    label: 'Средний',
    description: 'B1-B2 • Больше разнообразия',
    icon: 'TrendingUp',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'advanced' as const,
    label: 'Сложный',
    description: 'C1 • Продвинутые задания',
    icon: 'Zap',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
  {
    id: 'master' as const,
    label: 'Мастер',
    description: 'C2 • Все типы упражнений',
    icon: 'Crown',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
];

const DifficultySelector = ({ open, currentDifficulty, onSelect, onClose }: DifficultySelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl text-center">Выбери уровень сложности</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Уровень влияет на типы упражнений и количество баллов
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                onSelect(level.id);
              }}
              className={`
                relative p-4 sm:p-6 rounded-lg border-2 transition-all text-left
                ${currentDifficulty === level.id 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-border hover:border-primary/50'
                }
                ${level.bgColor}
              `}
            >
              {currentDifficulty === level.id && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                    <Icon name="Check" size={14} className="text-primary-foreground" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${level.bgColor} flex items-center justify-center`}>
                  <Icon name={level.icon} size={20} className={`${level.color} sm:w-6 sm:h-6`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg mb-1">{level.label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Как работает сложность:</p>
              <ul className="space-y-1">
                <li>• Новичок: перевод, выбор варианта</li>
                <li>• Средний: + синонимы, заполнение пропусков</li>
                <li>• Сложный: + составление предложений, контекст</li>
                <li>• Мастер: + обратный перевод, словообразование</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DifficultySelector;