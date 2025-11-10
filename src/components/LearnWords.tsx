import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { shouldMarkAsLearned, getProgressMessage } from '@/utils/wordProgress';

interface LearnWordsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  updateUser: (data: Partial<User>) => void;
}

interface ExerciseWord {
  word: string;
  translation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

const MOCK_EXERCISE_WORDS: ExerciseWord[] = [
  { word: 'serendipity', translation: 'счастливая случайность' },
  { word: 'embrace', translation: 'принимать' },
  { word: 'resilient', translation: 'устойчивый' },
  { word: 'abundant', translation: 'изобильный' },
  { word: 'mindful', translation: 'внимательный' }
];

const LearnWords = ({ user, onNavigate, updateUser }: LearnWordsProps) => {
  const [exerciseType, setExerciseType] = useState<'translation' | 'multiple' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [words, setWords] = useState<ExerciseWord[]>(MOCK_EXERCISE_WORDS);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleStartExercise = (type: 'translation' | 'multiple') => {
    if (user.status === 'free' && user.exercises_remaining <= 0) {
      toast({
        title: 'Превышен лимит',
        description: 'Доступно 3 упражнения в день. Оформите подписку за 199 руб/мес для снятия лимитов.',
        variant: 'destructive'
      });
      return;
    }
    setExerciseType(type);
    setCurrentStep(0);
    setShowResults(false);
    setWords(MOCK_EXERCISE_WORDS.map(w => ({ ...w, userAnswer: undefined, isCorrect: undefined })));
  };

  const handleCheckAnswer = () => {
    if (exerciseType === 'translation') {
      const isCorrect = userInput.toLowerCase().trim() === words[currentStep].translation.toLowerCase();
      const updatedWords = [...words];
      updatedWords[currentStep] = {
        ...updatedWords[currentStep],
        userAnswer: userInput,
        isCorrect
      };
      setWords(updatedWords);

      if (currentStep < words.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setUserInput('');
        }, 1000);
      } else {
        setTimeout(() => {
          setShowResults(true);
          updateUser({ 
            exercises_remaining: Math.max(0, user.exercises_remaining - 1),
            daily_exercises_count: user.daily_exercises_count + 1
          });
        }, 1000);
      }
    } else if (exerciseType === 'multiple') {
      const isCorrect = selectedOption === words[currentStep].translation;
      const updatedWords = [...words];
      updatedWords[currentStep] = {
        ...updatedWords[currentStep],
        userAnswer: selectedOption,
        isCorrect
      };
      setWords(updatedWords);

      if (currentStep < words.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setSelectedOption('');
        }, 1000);
      } else {
        setTimeout(() => {
          setShowResults(true);
          updateUser({ 
            exercises_remaining: Math.max(0, user.exercises_remaining - 1),
            daily_exercises_count: user.daily_exercises_count + 1
          });
        }, 1000);
      }
    }
  };

  const correctCount = words.filter(w => w.isCorrect).length;
  const progressPercent = ((currentStep + 1) / words.length) * 100;

  const multipleChoiceOptions = currentStep < words.length ? [
    words[currentStep].translation,
    'неправильный вариант 1',
    'неправильный вариант 2',
    'неправильный вариант 3'
  ].sort(() => Math.random() - 0.5) : [];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Учить слова</h1>
          </div>
          {exerciseType && !showResults && (
            <Badge className="text-sm">
              {currentStep + 1} / {words.length}
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
        {!exerciseType && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold mb-3">Выберите тип упражнения</h2>
              <p className="text-muted-foreground">
                У вас осталось {user.exercises_remaining} упражнений сегодня
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary"
                onClick={() => handleStartExercise('translation')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon name="Languages" size={28} className="text-primary" />
                    </div>
                  </div>
                  <CardTitle className="font-display text-xl">Перевод</CardTitle>
                  <CardDescription>
                    Переведите 5 слов с английского на русский
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary"
                onClick={() => handleStartExercise('multiple')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon name="ListChecks" size={28} className="text-primary" />
                    </div>
                  </div>
                  <CardTitle className="font-display text-xl">Выбор варианта</CardTitle>
                  <CardDescription>
                    Выберите правильный перевод из предложенных
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-accent/30 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Совет:</p>
                    <p>Для эффективного изучения рекомендуется выполнять упражнения регулярно. 
                    Путь важнее результата — сосредоточьтесь на процессе! ✨</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {exerciseType && !showResults && currentStep < words.length && (
          <div className="space-y-6 animate-scale-in">
            <Progress value={progressPercent} className="h-2" />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-display text-center">
                  {words[currentStep].word}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {exerciseType === 'translation' && (
                  <div className="space-y-3">
                    <Label htmlFor="translation">Ваш перевод:</Label>
                    <Input
                      id="translation"
                      placeholder="Введите перевод на русском"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCheckAnswer()}
                      autoFocus
                    />
                  </div>
                )}

                {exerciseType === 'multiple' && (
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    <div className="space-y-3">
                      {multipleChoiceOptions.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-base">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {words[currentStep].isCorrect !== undefined && (
                  <div className={`p-4 rounded-lg ${words[currentStep].isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="font-medium text-center">
                      {words[currentStep].isCorrect ? '✅ Верно!' : `❌ Неверно. Правильный ответ: ${words[currentStep].translation}`}
                    </p>
                  </div>
                )}

                {words[currentStep].isCorrect === undefined && (
                  <Button 
                    onClick={handleCheckAnswer} 
                    className="w-full" 
                    size="lg"
                    disabled={exerciseType === 'translation' ? !userInput.trim() : !selectedOption}
                  >
                    Проверить
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showResults && (
          <div className="space-y-6 animate-scale-in">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Trophy" size={40} className="text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">Упражнение завершено!</CardTitle>
                <CardDescription className="text-lg">
                  Правильных ответов: {correctCount} из {words.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {words.map((word, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                    <Icon 
                      name={word.isCorrect ? 'Check' : 'X'} 
                      size={20} 
                      className={word.isCorrect ? 'text-green-600 mt-1' : 'text-red-600 mt-1'} 
                    />
                    <div className="flex-1">
                      <p className="font-medium">{word.word}</p>
                      <p className="text-sm text-muted-foreground">
                        Правильный ответ: {word.translation}
                      </p>
                      {!word.isCorrect && word.userAnswer && (
                        <p className="text-sm text-red-600">
                          Ваш ответ: {word.userAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setExerciseType(null)} className="flex-1">
                    Новое упражнение
                  </Button>
                  <Button onClick={() => onNavigate('dashboard')} variant="outline" className="flex-1">
                    На главную
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground ${className}`}>{children}</div>;
}

export default LearnWords;