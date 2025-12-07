import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Sentence } from '@/types/sentence';

interface PhraseCardProps {
  phrase: Sentence;
  onDelete: (id: number) => void;
}

const PhraseCard = ({ phrase, onDelete }: PhraseCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="MessageSquare" size={16} className="text-primary flex-shrink-0" />
            <p className="font-medium text-lg">{phrase.english_text}</p>
          </div>
          
          <p className="text-muted-foreground mb-2">
            {phrase.russian_translation}
          </p>
          
          <p className="text-xs text-muted-foreground">
            Добавлено: {new Date(phrase.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(phrase.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default PhraseCard;
