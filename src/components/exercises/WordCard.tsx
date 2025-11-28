import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Word } from '@/utils/api';

interface WordCardProps {
  word: Word;
  showTranslation?: boolean;
  onPlayAudio?: () => void;
}

const WordCard = ({ word, showTranslation = true, onPlayAudio }: WordCardProps) => {
  const handlePlayAudio = () => {
    if (onPlayAudio) {
      onPlayAudio();
    } else {
      const utterance = new SpeechSynthesisUtterance(word.english_word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-500 bg-green-500/10';
      case 'intermediate':
        return 'text-blue-500 bg-blue-500/10';
      case 'advanced':
        return 'text-orange-500 bg-orange-500/10';
      case 'master':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const difficultyLabels = {
    beginner: 'A1-A2',
    intermediate: 'B1-B2',
    advanced: 'C1',
    master: 'C2',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">{word.english_word}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAudio}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="Volume2" size={18} className="text-primary" />
                </Button>
              </div>

              {word.transcription && (
                <p className="text-sm text-muted-foreground mb-1">
                  [{word.transcription}]
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {word.part_of_speech && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {word.part_of_speech}
                  </span>
                )}
                {word.difficulty_level && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(word.difficulty_level)}`}>
                    {difficultyLabels[word.difficulty_level as keyof typeof difficultyLabels]}
                  </span>
                )}
                {word.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {word.category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {showTranslation && (
            <div className="pt-3 border-t">
              <p className="text-lg font-medium text-muted-foreground">
                {word.russian_translation}
              </p>
            </div>
          )}

          {word.example_sentence && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground italic">
                "{word.example_sentence}"
              </p>
            </div>
          )}

          {word.examples && word.examples.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Примеры:</p>
              <ul className="space-y-1">
                {word.examples.slice(0, 2).map((example, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {example}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Icon name="BarChart3" size={14} />
                <span>Повторений: {word.recall_count}</span>
              </div>
              {word.last_recall_date && (
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  <span>
                    {new Date(word.last_recall_date).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              word.status === 'done' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {word.status === 'done' ? 'Изучено' : 'В процессе'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCard;
