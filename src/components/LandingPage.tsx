import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const PREFERENCES = [
  { id: 'travel', label: '✈️ Путешествия' },
  { id: 'business', label: '💼 Бизнес' },
  { id: 'technology', label: '💻 Технологии' },
  { id: 'ecology', label: '🌿 Экология' },
  { id: 'everyday', label: '🗣️ Повседневное общение' },
  { id: 'academic', label: '📚 Академический' },
  { id: 'food', label: '🍕 Еда' },
  { id: 'health', label: '💊 Здоровье' },
  { id: 'phrasal_verbs', label: '🔤 Фразовые глаголы' },
  { id: 'popular_100', label: '⭐ 100 популярных слов' }
];

const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockUser: User = {
      id: Math.floor(Math.random() * 10000),
      name: name || 'Пользователь',
      email: email,
      status: 'free',
      preferences: selectedPreferences,
      word_count: 0,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6">
          ShagToSpeak
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Изучение английских слов шаг за шагом. Путь важнее цели. 
          Добавляйте слова, выполняйте упражнения, отслеживайте прогресс 
          и наслаждайтесь процессом. Начните свой путь сегодня!
        </p>
      </div>

      <Card className="w-full max-w-md animate-scale-in shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {isRegister ? 'Регистрация' : 'Вход'}
          </CardTitle>
          <CardDescription>
            {isRegister ? 'Создайте аккаунт для начала изучения' : 'Войдите в свой аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="space-y-3 pt-2">
                <Label className="text-base">Выберите темы для изучения</Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                  {PREFERENCES.map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={pref.id}
                        checked={selectedPreferences.includes(pref.id)}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                      <label
                        htmlFor={pref.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {pref.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-primary hover:underline"
            >
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>

          {isRegister && (
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong>Бесплатный тариф:</strong> 3 упражнения в день, максимум 50 слов
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;