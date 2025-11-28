import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Exercise, apiClient } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface ExerciseSessionProps {
  exercises: Exercise[];
  difficulty: string;
  onComplete: (results: any) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ExerciseSession = ({ exercises, difficulty, onComplete, onBack, isLoading }: ExerciseSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(exercises.length).fill(''));
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = value;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!userAnswers[currentIndex]) {
      toast({
        title: 'Введи ответ',
        description: 'Пожалуйста, выбери или напиши ответ',
        variant: 'destructive',
      });
      return;
    }

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const answersData = exercises.map((ex, idx) => ({
        word_id: ex.word_id,
        answer: userAnswers[idx],
        type: ex.type,
        correct_answer: ex.correct_answer,
      }));

      const data = await apiClient.submitAnswers(answersData, difficulty, timeSpent);
      setResults(data);
      setShowResult(true);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить ответы',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Icon name="Loader2" size={48} className="animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Загрузка упражнений...</p>
      </div>
    );
  }

  if (showResult && results) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-display font-bold text-center">Результаты</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="border-2 border-primary mb-6">
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Icon name="Trophy" size={48} className="text-primary" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl mb-2">Отличная работа!</h2>
                <p className="text-muted-foreground">Ты завершил упражнение</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-3 mb-6">
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {results.correct_count}/{results.total_count}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Правильно</p>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">
                  +{results.total_points}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Баллов</p>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-500 mb-1 flex items-center justify-center gap-1 sm:gap-2">
                  <Icon name="Flame" size={24} className="text-orange-500 sm:w-8 sm:h-8" />
                  {results.current_streak}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Серия</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {results.results.map((result: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    result.is_correct
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-red-500 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{exercises[idx].question}</p>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Твой ответ: <span className="font-medium">{userAnswers[idx]}</span>
                        </p>
                        {!result.is_correct && (
                          <p className="text-green-600 dark:text-green-400">
                            Правильный ответ: <span className="font-medium">{result.correct_answer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Icon
                      name={result.is_correct ? 'CheckCircle2' : 'XCircle'}
                      size={24}
                      className={result.is_correct ? 'text-green-500' : 'text-red-500'}
                    />
                  </div>
                  {result.points_earned > 0 && (
                    <div className="mt-2 text-sm text-primary font-medium">
                      +{result.points_earned} баллов
                    </div>
                  )}
                </div>
              ))}
            </div>

              <Button onClick={() => onComplete(results)} size="lg" className="w-full">
                <Icon name="Home" size={20} className="mr-2" />
                Вернуться
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Нет доступных упражнений</p>
        <Button onClick={onBack} className="mt-4">
          Вернуться
        </Button>
      </div>
    );
  }

  const renderExerciseContent = () => {
    switch (currentExercise.type) {
      case 'translation':
      case 'reverse_translation':
      case 'sentence_construction':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-2xl font-bold mb-2">{currentExercise.question}</p>
              {currentExercise.transcription && (
                <p className="text-sm text-muted-foreground mb-1">[{currentExercise.transcription}]</p>
              )}
              {currentExercise.part_of_speech && (
                <p className="text-xs text-muted-foreground">({currentExercise.part_of_speech})</p>
              )}
              {currentExercise.hint && (
                <p className="text-sm text-muted-foreground mt-2">Подсказка: {currentExercise.hint}</p>
              )}
            </div>
            <Input
              placeholder="Введи ответ..."
              value={userAnswers[currentIndex]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              autoFocus
            />
          </div>
        );

      case 'multiple_choice':
      case 'synonym_antonym':
      case 'fill_blank':
      case 'context_match':
      case 'word_formation':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-2xl font-bold mb-2">{currentExercise.question}</p>
              {currentExercise.transcription && (
                <p className="text-sm text-muted-foreground mb-1">[{currentExercise.transcription}]</p>
              )}
              {currentExercise.part_of_speech && (
                <p className="text-xs text-muted-foreground">({currentExercise.part_of_speech})</p>
              )}
            </div>
            <RadioGroup
              value={userAnswers[currentIndex]}
              onValueChange={handleAnswerChange}
            >
              <div className="space-y-3">
                {currentExercise.options?.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      userAnswers[currentIndex] === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAnswerChange(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return <p>Неизвестный тип упражнения</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="text-sm font-medium">
            {currentIndex + 1} / {exercises.length}
          </div>
          <div className="w-10" />
        </div>
        <div className="container mx-auto px-4 pb-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-0 shadow-none sm:border sm:shadow-sm">
          <CardContent className="p-4 sm:p-6">
            {renderExerciseContent()}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="lg"
              className="flex-1"
            >
              <Icon name="ChevronLeft" size={20} />
              <span className="hidden sm:inline ml-2">Назад</span>
            </Button>
            <Button onClick={handleNext} size="lg" className="flex-[2]">
              {currentIndex === exercises.length - 1 ? (
                <>
                  Завершить
                  <Icon name="Check" size={20} className="ml-2" />
                </>
              ) : (
                <>
                  Далее
                  <Icon name="ChevronRight" size={20} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExerciseSession;