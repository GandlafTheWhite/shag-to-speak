import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { LEARNING_TOPICS } from '@/data/topics';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockUser: User = {
      id: Math.floor(Math.random() * 10000),
      name: name || 'Пользователь',
      email: email,
      status: 'free',
      preferences: selectedPreferences,
      word_count: 11,
      exercises_remaining: 3,
      daily_exercises_count: 0
    };
    
    onLogin(mockUser);
  };



  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const features = [
    {
      icon: 'Brain',
      title: 'AI-генерация контента',
      description: 'Автоматическое создание переводов и примеров для каждого слова'
    },
    {
      icon: 'Target',
      title: 'Персонализация',
      description: 'Выбирайте темы для изучения — система адаптируется под ваши интересы'
    },
    {
      icon: 'Zap',
      title: 'Разнообразные упражнения',
      description: 'Перевод, множественный выбор, синонимы и составление предложений'
    },
    {
      icon: 'TrendingUp',
      title: 'Отслеживание прогресса',
      description: 'Наглядная статистика и визуализация вашего пути к знанию языка'
    },
    {
      icon: 'Heart',
      title: 'Философия пути',
      description: 'Регулярность важнее интенсивности — наслаждайтесь процессом'
    },
    {
      icon: 'Download',
      title: 'Экспорт данных',
      description: 'Скачивайте словарь в Excel для использования где угодно'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background z-0"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center md:text-left animate-fade-in">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary font-medium text-sm">Путь важнее цели ✨</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
                ShagToSpeak
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Изучайте английский шаг за шагом. Добавляйте слова, выполняйте упражнения и наслаждайтесь процессом.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    setIsRegister(true);
                    setShowAuthDialog(true);
                  }}
                >
                  Начать бесплатно
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
                

              </div>

              <div className="mt-8 flex items-center gap-6 justify-center md:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>Бесплатно</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>Без карты</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>50 слов</span>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in hidden md:block">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <img 
                  src="https://cdn.poehali.dev/files/877b18d5-3656-4067-adbe-89a2510b72e3.png" 
                  alt="Balance and Harmony" 
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Почему ShagToSpeak?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Мы создали инструмент, который делает изучение английского приятным и эффективным
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon name={feature.icon as any} size={28} className="text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Как это работает
            </h2>
            <p className="text-xl text-muted-foreground">
              Три простых шага к изучению английского
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-0"></div>
            
            {[
              {
                step: '01',
                title: 'Добавьте слова',
                description: 'Вводите слова вручную или выбирайте готовые наборы по темам',
                icon: 'Plus'
              },
              {
                step: '02',
                title: 'Выполняйте упражнения',
                description: 'Разнообразные задания помогут запомнить слова навсегда',
                icon: 'BookOpen'
              },
              {
                step: '03',
                title: 'Отслеживайте прогресс',
                description: 'Смотрите статистику и наслаждайтесь своим ростом',
                icon: 'LineChart'
              }
            ].map((step, idx) => (
              <Card key={idx} className="relative z-10 text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <CardTitle className="font-display text-2xl mb-3">{step.title}</CardTitle>
                  <CardDescription className="text-base">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/20 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Начните свой путь сегодня
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Бесплатный тариф включает 50 слов и 3 упражнения в день — более чем достаточно, чтобы начать
          </p>
          
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 shadow-xl hover:shadow-2xl transition-all"
            onClick={() => {
              setIsRegister(true);
              setShowAuthDialog(true);
            }}
          >
            Попробовать бесплатно
            <Icon name="Rocket" size={24} className="ml-3" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <button 
              className="text-primary hover:underline font-medium"
              onClick={() => {
                setIsRegister(false);
                setShowAuthDialog(true);
              }}
            >
              Войти
            </button>
          </p>
        </div>
      </section>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {isRegister ? 'Регистрация' : 'Вход'}
            </DialogTitle>
            <DialogDescription>
              {isRegister ? 'Создайте аккаунт для начала изучения' : 'Войдите в свой аккаунт'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Ваше имя" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    Номер телефона 
                    <span className="text-xs text-muted-foreground font-normal">(необязательно)</span>
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+7 (999) 123-45-67" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-base">Выберите темы для изучения</Label>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1 border rounded-lg">
                    {LEARNING_TOPICS.map((topic) => (
                      <div key={topic.id} className="flex items-start space-x-3 p-2 hover:bg-accent/50 rounded transition-colors">
                        <Checkbox 
                          id={topic.id}
                          checked={selectedPreferences.includes(topic.id)}
                          onCheckedChange={() => togglePreference(topic.id)}
                          className="mt-1"
                        />
                        <label
                          htmlFor={topic.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-sm">{topic.label}</div>
                          <div className="text-xs text-muted-foreground">{topic.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg">
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-primary hover:underline"
            >
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>

          {isRegister && (
            <div className="p-4 bg-accent rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong>Бесплатный тариф:</strong> 3 упражнения в день, максимум 50 слов
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;