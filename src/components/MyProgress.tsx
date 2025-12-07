import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { apiClient, Stats } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import StreakCounter from './gamification/StreakCounter';
import PointsDisplay from './gamification/PointsDisplay';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MyProgressProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
}

const MyProgress = ({ user, onNavigate }: MyProgressProps) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить статистику',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    toast({
      title: 'В разработке',
      description: 'Экспорт в Excel будет доступен в следующих версиях'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загружаем статистику...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Не удалось загрузить статистику</p>
            <Button onClick={loadStats} className="mt-4">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentDone = stats.words.total > 0 
    ? Math.round((stats.words.done / stats.words.total) * 100) 
    : 0;

  const pieData = [
    { name: 'В изучении', value: stats.words.learning, color: '#3b82f6' },
    { name: 'Выучено', value: stats.words.done, color: '#10b981' }
  ].filter(item => item.value > 0);

  const weeklyData = stats.activity.weekly.map(day => ({
    date: new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' }),
    count: day.count
  }));
  
  console.log('[MyProgress] Stats loaded:', {
    words: stats.words,
    exercises: stats.exercises,
    pieData,
    weeklyData,
    topWords: stats.top_words.length
  });

  const exerciseTypeLabels: Record<string, string> = {
    'translation': 'Перевод',
    'multiple_choice': 'Выбор варианта',
    'synonym_antonym': 'Синонимы/Антонимы',
    'fill_blank': 'Заполнить пропуск',
    'sentence_construction': 'Составить предложение',
    'context_match': 'Контекст',
    'reverse_translation': 'Обратный перевод',
    'word_formation': 'Словообразование'
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
          <div className="flex items-center gap-2">
            <Button variant="default" size="default" onClick={() => onNavigate('dashboard')} className="bg-primary hover:bg-primary/90">
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-display font-bold ml-2">Мои успехи</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="hidden sm:flex">
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="sm:hidden">
            <Icon name="Download" size={18} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-4">
            <Icon name="Award" size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Ваш прогресс</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Путь к знанию английского языка
          </p>
        </div>

        {(user.total_points !== undefined || user.current_streak !== undefined) && (
          <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2">
            {user.total_points !== undefined && (
              <PointsDisplay totalPoints={user.total_points} />
            )}
            {user.current_streak !== undefined && (
              <StreakCounter 
                currentStreak={user.current_streak} 
                longestStreak={user.longest_streak || 0} 
              />
            )}
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Icon name="BookOpen" size={24} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">В изучении</p>
                  <CardTitle className="text-xl sm:text-2xl font-display">
                    {stats.words.learning}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Выучено</p>
                  <CardTitle className="text-xl sm:text-2xl font-display">
                    {stats.words.done}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Icon name="Library" size={24} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Всего слов</p>
                  <CardTitle className="text-xl sm:text-2xl font-display">
                    {stats.words.total}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Icon name="Target" size={24} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Точность</p>
                  <CardTitle className="text-xl sm:text-2xl font-display">
                    {stats.exercises.accuracy}%
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base sm:text-lg">Распределение слов</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="PieChart" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет слов для отображения</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base sm:text-lg">Активность за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет данных об активности</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="font-display text-base sm:text-lg">Прогресс изучения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Выученные слова</span>
                <span className="font-medium">{percentDone}%</span>
              </div>
              <Progress value={percentDone} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-blue-50">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.words.learning}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">На изучении</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-green-50">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.words.done}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Выучено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.top_words.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="font-display text-base sm:text-lg">Топ слов для повторения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {stats.top_words.slice(0, 5).map((word, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm sm:text-base">{word.word}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{word.translation}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-medium">{word.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">{word.attempts} раз</p>
                    </div>
                  </div>
                  <Progress value={word.accuracy} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {stats.exercises.by_type && stats.exercises.by_type.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="font-display text-base sm:text-lg">Статистика по типам упражнений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {stats.exercises.by_type.map((type, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate flex-1">
                      {exerciseTypeLabels[type.type] || type.type}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                      <span className="text-muted-foreground text-xs sm:text-sm">{type.count} шт</span>
                      <span className="font-medium">{type.accuracy}%</span>
                    </div>
                  </div>
                  <Progress value={type.accuracy} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="font-display text-base sm:text-lg">Общая статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-muted-foreground text-sm sm:text-base">Дней с момента регистрации</span>
              <span className="font-medium text-sm sm:text-base">{stats.activity.days_active}</span>
            </div>
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-muted-foreground text-sm sm:text-base">Дней с упражнениями</span>
              <span className="font-medium text-sm sm:text-base">{stats.activity.unique_days_active || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-muted-foreground text-sm sm:text-base">Упражнений выполнено</span>
              <span className="font-medium text-sm sm:text-base">{stats.exercises.total}</span>
            </div>
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-muted-foreground text-sm sm:text-base">Правильных ответов</span>
              <span className="font-medium text-sm sm:text-base">{stats.exercises.correct}</span>
            </div>
            {stats.exercises.avg_time !== undefined && stats.exercises.avg_time > 0 && (
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="text-muted-foreground text-sm sm:text-base">Среднее время на упражнение</span>
                <span className="font-medium text-sm sm:text-base">{stats.exercises.avg_time.toFixed(1)} сек</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Icon name="Sparkles" size={28} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg mb-2">
                  Продолжайте в том же духе!
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Вы на правильном пути! Каждое выученное слово — это шаг вперед. 
                  Регулярность важнее интенсивности. Наслаждайтесь процессом изучения, 
                  и результаты не заставят себя ждать. ✨
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyProgress;