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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-display text-xl mb-2">
              {word.english_word}
            </CardTitle>
            <CardDescription className="text-base">
              {word.russian_translation}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={word.status === 'done' ? 'default' : 'secondary'}>
              {word.status === 'learning' ? '📖 Изучаю' : '✅ Выучил'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {word.recall_count} повторений
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Примеры:</p>
            <ul className="space-y-1">
              {word.examples.map((ex, idx) => (
                <li key={idx} className="text-sm text-foreground pl-4 relative before:content-['•'] before:absolute before:left-0">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(word.id, word.status === 'learning' ? 'done' : 'learning')}
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
