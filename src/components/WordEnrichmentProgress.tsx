import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { apiClient } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface WordEnrichmentProgressProps {
  onComplete?: () => void;
}

const WordEnrichmentProgress = ({ onComplete }: WordEnrichmentProgressProps) => {
  const [wordsToEnrich, setWordsToEnrich] = useState<Array<{ id: number; english_word: string }>>([]);
  const [enrichedCount, setEnrichedCount] = useState(0);
  const [isEnriching, setIsEnriching] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadWordsNeedingEnrichment();
  }, []);

  const loadWordsNeedingEnrichment = async () => {
    try {
      const data = await apiClient.getWordsNeedingEnrichment();
      setWordsToEnrich(data.words);
    } catch (error) {
      console.error('Failed to load words:', error);
    }
  };

  const enrichAllWords = async () => {
    if (wordsToEnrich.length === 0) {
      toast({
        title: 'Все готово!',
        description: 'Все слова уже обогащены метаданными'
      });
      onComplete?.();
      return;
    }

    setIsEnriching(true);
    setEnrichedCount(0);

    for (let i = 0; i < wordsToEnrich.length; i++) {
      const word = wordsToEnrich[i];
      setCurrentWord(word.english_word);

      try {
        await apiClient.enrichWord(word.id);
        setEnrichedCount(i + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to enrich ${word.english_word}:`, error);
      }
    }

    setIsEnriching(false);
    setCurrentWord('');
    
    toast({
      title: 'Обогащение завершено!',
      description: `Обработано ${wordsToEnrich.length} слов`
    });

    onComplete?.();
  };

  if (wordsToEnrich.length === 0 && !isEnriching) {
    return null;
  }

  const progress = wordsToEnrich.length > 0 
    ? (enrichedCount / wordsToEnrich.length) * 100 
    : 0;

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Sparkles" size={24} className="text-primary" />
          </div>
          <div>
            <CardTitle>Улучшение словаря</CardTitle>
            <CardDescription>
              {isEnriching 
                ? `Обработка: ${currentWord}...`
                : `${wordsToEnrich.length} слов готовы к обогащению`
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {enrichedCount} / {wordsToEnrich.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground">
          Добавим транскрипцию, часть речи и примеры использования для всех слов. 
          Это улучшит качество упражнений!
        </p>

        <Button
          onClick={enrichAllWords}
          disabled={isEnriching}
          className="w-full"
        >
          {isEnriching ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Обрабатываем...
            </>
          ) : (
            <>
              <Icon name="Sparkles" size={20} className="mr-2" />
              Улучшить словарь
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WordEnrichmentProgress;
