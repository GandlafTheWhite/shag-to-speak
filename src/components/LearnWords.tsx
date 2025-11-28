import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { Exercise, ExerciseCategory, apiClient } from '@/utils/api';
import DifficultySelector from '@/components/exercises/DifficultySelector';
import CategoryPicker from '@/components/exercises/CategoryPicker';
import ExerciseSession from '@/components/exercises/ExerciseSession';

interface LearnWordsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  updateUser: (data: Partial<User>) => void;
}

const LearnWords = ({ user, onNavigate, updateUser }: LearnWordsProps) => {
  const [currentView, setCurrentView] = useState<'menu' | 'category-select' | 'exercise'>('menu');
  const [difficulty, setDifficulty] = useState<string>(user.exercise_difficulty || 'beginner');
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const { toast } = useToast();

  const difficultyLabels = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Сложный',
    master: 'Мастер',
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await apiClient.getExerciseCategories();
      setCategories(data.categories);
      
      if (data.categories.length === 0) {
        toast({
          title: 'Нет слов для упражнений',
          description: 'Добавь слова в словарь, чтобы начать упражнения',
          variant: 'destructive',
        });
        onNavigate('words');
      } else if (data.categories.length === 1) {
        setSelectedCategory(data.categories[0].name);
        loadExercises(data.categories[0].name);
      } else {
        setCurrentView('category-select');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить категории',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadExercises = async (category?: string) => {
    if (user.status === 'free' && user.exercises_remaining <= 0) {
      toast({
        title: 'Превышен лимит',
        description: 'Доступно 3 упражнения в день. Оформите подписку за 199 руб/мес для снятия лимитов.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingExercises(true);
    try {
      const data = await apiClient.getExercises(category, difficulty);
      setExercises(data.exercises);
      setCurrentView('exercise');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить упражнения',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const handleStartExercises = () => {
    loadCategories();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    loadExercises(category);
  };

  const handleDifficultyChange = async (newDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'master') => {
    try {
      await apiClient.updateSettings(user.id, { exercise_difficulty: newDifficulty });
      setDifficulty(newDifficulty);
      updateUser({ exercise_difficulty: newDifficulty });
      toast({
        title: 'Сложность обновлена',
        description: `Уровень: ${difficultyLabels[newDifficulty]}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить сложность',
        variant: 'destructive',
      });
    }
  };

  const handleExerciseComplete = (results: { correct_count: number; total_count: number; total_points: number; current_streak: number; exercises_remaining: number }) => {
    updateUser({
      exercises_remaining: results.exercises_remaining,
      total_points: (user.total_points || 0) + results.total_points,
      current_streak: results.current_streak,
    });
    setCurrentView('menu');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedCategory(null);
  };

  if (currentView === 'category-select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl mb-2">Упражнения</h2>
            <p className="text-muted-foreground">
              Выбери категорию для тренировки
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDifficultyModal(true)}
            >
              <Icon name="Settings" size={20} className="mr-2" />
              {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
            </Button>
            <Button variant="ghost" onClick={handleBackToMenu}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <CategoryPicker
          categories={categories}
          onSelect={handleCategorySelect}
          isLoading={isLoadingCategories}
        />

        <DifficultySelector
          open={showDifficultyModal}
          currentDifficulty={difficulty}
          onSelect={handleDifficultyChange}
          onClose={() => setShowDifficultyModal(false)}
        />
      </div>
    );
  }

  if (currentView === 'exercise') {
    return (
      <ExerciseSession
        exercises={exercises}
        difficulty={difficulty}
        onComplete={handleExerciseComplete}
        onBack={handleBackToMenu}
        isLoading={isLoadingExercises}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Упражнения</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDifficultyModal(true)}
          >
            <Icon name="Settings" size={18} className="mr-2" />
            {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Баллы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {user.total_points || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Текущая серия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Icon name="Flame" size={24} className="text-orange-500" />
                {user.current_streak || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Осталось сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {user.status === 'premium' ? '∞' : user.exercises_remaining}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Сложность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={handleStartExercises}
            disabled={isLoadingCategories}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-blue-500/50">
              <Icon name="Brain" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">Умное упражнение</h3>
              <p className="text-sm text-muted-foreground">Адаптивная система</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Icon name="BookMarked" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">Словарные карточки</h3>
              <p className="text-sm text-muted-foreground">Скоро</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Icon name="Volume2" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">Аудирование</h3>
              <p className="text-sm text-muted-foreground">Скоро</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Icon name="MessageSquare" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">Диалоги</h3>
              <p className="text-sm text-muted-foreground">Скоро</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Icon name="Lightbulb" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">Викторина</h3>
              <p className="text-sm text-muted-foreground">Скоро</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Icon name="Sparkles" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg mb-1">AI Репетитор</h3>
              <p className="text-sm text-muted-foreground">Скоро</p>
            </div>
          </button>
        </div>
      </main>

      <DifficultySelector
        open={showDifficultyModal}
        currentDifficulty={difficulty}
        onSelect={handleDifficultyChange}
        onClose={() => setShowDifficultyModal(false)}
      />
    </div>
  );
};

export default LearnWords;