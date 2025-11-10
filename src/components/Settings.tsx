import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { LEARNING_TOPICS } from '@/data/topics';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings') => void;
  updateUser: (data: Partial<User>) => void;
}

const Settings = ({ user, onNavigate, updateUser }: SettingsProps) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(user.preferences);
  const { toast } = useToast();

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleSave = () => {
    updateUser({
      name,
      email,
      preferences: selectedPreferences
    });
    
    toast({
      title: 'Настройки сохранены',
      description: 'Ваши данные успешно обновлены'
    });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Настройки профиля</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display">Личные данные</CardTitle>
            <CardDescription>Обновите информацию о себе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display">Темы для изучения</CardTitle>
            <CardDescription>
              Выберите интересующие вас темы — слова будут подбираться под ваши предпочтения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
              {LEARNING_TOPICS.map((topic) => (
                <div key={topic.id} className="flex items-start space-x-3 p-3 hover:bg-accent/50 rounded transition-colors">
                  <Checkbox 
                    id={`settings-${topic.id}`}
                    checked={selectedPreferences.includes(topic.id)}
                    onCheckedChange={() => togglePreference(topic.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`settings-${topic.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{topic.label}</div>
                    <div className="text-xs text-muted-foreground">{topic.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display">Подписка</CardTitle>
            <CardDescription>
              Текущий статус: <strong>{user.status === 'free' ? 'Бесплатный' : 'Premium'}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.status === 'free' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Обновите подписку до Premium для получения неограниченного доступа ко всем функциям
                </p>
                <div className="p-4 bg-accent/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    <span className="text-sm">Безлимитное количество слов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    <span className="text-sm">Неограниченные упражнения</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    <span className="text-sm">Приоритетная поддержка</span>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <Icon name="Crown" size={20} className="mr-2" />
                  Оформить Premium за 199 ₽/мес
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                У вас активна Premium подписка. Спасибо за поддержку! ⭐
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} size="lg" className="flex-1">
            <Icon name="Save" size={20} className="mr-2" />
            Сохранить изменения
          </Button>
          <Button onClick={() => onNavigate('dashboard')} variant="outline" size="lg">
            Отмена
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;