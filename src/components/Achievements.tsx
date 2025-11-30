import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import AchievementBadge, { type Achievement } from './gamification/AchievementBadge';

interface AchievementsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
}

const Achievements = ({ user, onNavigate }: AchievementsProps) => {
  const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
      id: 1,
      achievement_code: 'first_word',
      name: 'Первое слово',
      description: 'Добавь своё первое слово в словарь',
      icon: '🌱',
      points: 10,
      unlocked: true,
      unlocked_at: new Date().toISOString(),
    },
    {
      id: 2,
      achievement_code: 'ten_words',
      name: 'Десяточка',
      description: 'Добавь 10 слов в словарь',
      icon: '📚',
      points: 25,
      unlocked: true,
      progress: 10,
      total: 10,
    },
    {
      id: 3,
      achievement_code: 'first_exercise',
      name: 'Первые шаги',
      description: 'Выполни первое упражнение',
      icon: '🎯',
      points: 15,
      unlocked: true,
    },
    {
      id: 4,
      achievement_code: 'week_streak',
      name: 'Неделя подряд',
      description: 'Занимайся 7 дней подряд',
      icon: '🔥',
      points: 50,
      unlocked: false,
      progress: user.current_streak || 0,
      total: 7,
    },
    {
      id: 5,
      achievement_code: 'hundred_points',
      name: 'Первая сотня',
      description: 'Набери 100 баллов',
      icon: '💯',
      points: 20,
      unlocked: (user.total_points || 0) >= 100,
      progress: user.total_points || 0,
      total: 100,
    },
    {
      id: 6,
      achievement_code: 'fifty_words',
      name: 'Полсотни',
      description: 'Добавь 50 слов в словарь',
      icon: '📖',
      points: 50,
      unlocked: user.word_count >= 50,
      progress: user.word_count,
      total: 50,
    },
    {
      id: 7,
      achievement_code: 'month_streak',
      name: 'Месяц упорства',
      description: 'Занимайся 30 дней подряд',
      icon: '🏆',
      points: 150,
      unlocked: false,
      progress: user.current_streak || 0,
      total: 30,
    },
    {
      id: 8,
      achievement_code: 'thousand_points',
      name: 'Тысячник',
      description: 'Набери 1000 баллов',
      icon: '⭐',
      points: 100,
      unlocked: (user.total_points || 0) >= 1000,
      progress: user.total_points || 0,
      total: 1000,
    },
    {
      id: 9,
      achievement_code: 'hundred_exercises',
      name: 'Сотня упражнений',
      description: 'Выполни 100 упражнений',
      icon: '💪',
      points: 75,
      unlocked: false,
      progress: 0,
      total: 100,
    },
    {
      id: 10,
      achievement_code: 'master_level',
      name: 'Мастер',
      description: 'Достигни уровня Мастер',
      icon: '👑',
      points: 200,
      unlocked: user.exercise_difficulty === 'master',
    },
    {
      id: 11,
      achievement_code: 'perfect_ten',
      name: 'Идеальная десятка',
      description: 'Выполни 10 упражнений подряд без ошибок',
      icon: '🎖️',
      points: 100,
      unlocked: false,
      progress: 0,
      total: 10,
    },
    {
      id: 12,
      achievement_code: 'polyglot',
      name: 'Полиглот',
      description: 'Выучи слова из 5 разных категорий',
      icon: '🌍',
      points: 60,
      unlocked: false,
      progress: 0,
      total: 5,
    },
  ];
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const { toast } = useToast();

  const filteredAchievements = MOCK_ACHIEVEMENTS.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const completionPercent = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Button variant="default" size="default" onClick={() => onNavigate('dashboard')} className="bg-primary hover:bg-primary/90">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            <span className="hidden sm:inline">Назад</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground ml-2">
            Достижения
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">Твои достижения</h2>
              <p className="text-muted-foreground">
                Разблокировано {unlockedCount} из {totalCount}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{Math.round(completionPercent)}%</div>
              <p className="text-sm text-muted-foreground">завершено</p>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/60 h-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unlocked' | 'locked')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">
              Все ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              <Icon name="CheckCircle2" size={16} className="mr-2" />
              Разблокировано ({unlockedCount})
            </TabsTrigger>
            <TabsTrigger value="locked">
              <Icon name="Lock" size={16} className="mr-2" />
              Заблокировано ({totalCount - unlockedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map(achievement => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Award" size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'unlocked' ? 'Пока нет разблокированных достижений' : 'Все достижения разблокированы!'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Achievements;