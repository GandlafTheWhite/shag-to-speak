import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';

interface MyProgressProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
}

const MyProgress = ({ user, onNavigate }: MyProgressProps) => {
  const learningCount = 8;
  const doneCount = 3;
  const totalCount = user.word_count || learningCount + doneCount;
  const percentDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  
  const stats = [
    {
      label: 'Слова на изучении',
      value: learningCount,
      icon: 'BookOpen',
      color: 'text-blue-500'
    },
    {
      label: 'Выученные слова',
      value: doneCount,
      icon: 'CheckCircle',
      color: 'text-green-500'
    },
    {
      label: 'Всего слов',
      value: totalCount,
      icon: 'Library',
      color: 'text-purple-500'
    },
    {
      label: 'Процент выученных',
      value: `${percentDone}%`,
      icon: 'TrendingUp',
      color: 'text-orange-500'
    }
  ];

  const handleExportExcel = () => {
    alert('Экспорт в Excel будет доступен после подключения API');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Мои успехи</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт в Excel
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Icon name="Award" size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Ваш прогресс</h2>
          <p className="text-muted-foreground text-lg">
            Путь к знанию английского языка
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-accent ${stat.color}`}>
                    <Icon name={stat.icon as any} size={28} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <CardTitle className="text-3xl font-display">
                      {stat.value}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display">Визуализация прогресса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Выученные слова</span>
                <span className="font-medium">{percentDone}%</span>
              </div>
              <Progress value={percentDone} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{learningCount}</div>
                <div className="text-sm text-muted-foreground mt-1">На изучении</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{doneCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Выучено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display">Дополнительная статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Последнее повторение</span>
              <span className="font-medium">Сегодня</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Среднее время изучения</span>
              <span className="font-medium">5 дней на слово</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Самое повторяемое слово</span>
              <span className="font-medium">resilient (10 раз)</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Упражнений выполнено</span>
              <span className="font-medium">{user.daily_exercises_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Icon name="Sparkles" size={28} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-display font-bold text-lg mb-2">
                  Продолжайте в том же духе!
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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