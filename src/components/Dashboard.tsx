import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';

interface DashboardProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  onLogout: () => void;
}

const Dashboard = ({ user, onNavigate, onLogout }: DashboardProps) => {
  const wordLimit = user.status === 'free' ? 50 : 999;
  const progressPercent = (user.word_count / wordLimit) * 100;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-foreground">
            ShagToSpeak
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-foreground mb-4">
            Добро пожаловать, {user.name}! 🌟
          </h2>
          <p className="text-lg text-muted-foreground">
            Ваш путь к английскому продолжается
          </p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Слов в словаре
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {user.word_count} / {wordLimit}
              </div>
              <Progress value={progressPercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Упражнений сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {user.exercises_remaining}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user.status === 'free' ? 'осталось из 3' : 'без ограничений'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user.status === 'free' ? '🆓 Free' : '⭐ Premium'}
              </div>
              {user.status === 'free' && (
                <p className="text-xs text-primary mt-2">
                  Обновить до Premium
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('learn')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Учить слова</CardTitle>
                  <CardDescription>Выполните упражнения</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('words')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon name="Library" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Мой словарь</CardTitle>
                  <CardDescription>Управление словами</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('progress')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Мои успехи</CardTitle>
                  <CardDescription>Статистика прогресса</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('help')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon name="HelpCircle" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Помощь</CardTitle>
                  <CardDescription>FAQ и поддержка</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-accent/50 rounded-lg border">
          <div className="flex items-start gap-4">
            <Icon name="Lightbulb" size={24} className="text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Философия пути
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Изучение языка — это путь, а не цель. Каждое новое слово — это шаг вперед. 
                Не спешите, наслаждайтесь процессом. Постепенное продвижение приносит 
                самые устойчивые результаты. ✨
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;