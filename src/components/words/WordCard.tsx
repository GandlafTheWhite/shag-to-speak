import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

export interface Word {
  id: number;
  english_word: string;
  russian_translation: string;
  examples: string[];
  status: 'learning' | 'done';
  recall_count: number;
  category?: string;
}

interface WordCardProps {
  word: Word;
  onStatusChange: (wordId: number, newStatus: 'learning' | 'done') => void;
  onDelete: (wordId: number) => void;
  onSelectWord: (word: Word | null) => void;
}

const WordCard = ({ word, onStatusChange, onDelete, onSelectWord }: WordCardProps) => {
  const isGenerating = word.is_generating || word.russian_translation === '...';
  
  return (
    <Card className="hover:shadow-md transition-shadow max-w-full">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg sm:text-xl mb-2 flex items-center gap-2 break-words">
              {word.english_word}
              {isGenerating && (
                <Icon name="Loader2" size={18} className="animate-spin text-primary flex-shrink-0" />
              )}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base break-words">
              {isGenerating ? (
                <span className="text-muted-foreground italic">Генерируем перевод...</span>
              ) : (
                word.russian_translation
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant={word.status === 'done' ? 'default' : 'secondary'} className="whitespace-nowrap">
              {word.status === 'learning' ? '📖 Изучаю' : '✅ Выучил'}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {word.recall_count} повторений
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Примеры:</p>
            <ul className="space-y-1">
              {word.examples.map((ex, idx) => (
                <li key={idx} className={`text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 break-words ${isGenerating ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(word.id, word.status === 'learning' ? 'done' : 'learning')}
              className="flex-shrink-0"
            >
              <Icon name={word.status === 'learning' ? 'Check' : 'RotateCcw'} size={16} className="mr-1" />
              {word.status === 'learning' ? 'Выучил' : 'Вернуть'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => onSelectWord(word)}>
                  <Icon name="Trash2" size={16} className="text-destructive" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Удалить слово?</DialogTitle>
                  <DialogDescription>
                    Вы уверены, что хотите удалить "{word.english_word}" из словаря?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => onSelectWord(null)}>
                    Отмена
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(word.id)}>
                    Удалить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCard;