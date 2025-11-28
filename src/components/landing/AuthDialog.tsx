import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

import { LEARNING_TOPICS } from '@/data/topics';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRegister: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  selectedPreferences: string[];
  togglePreference: (prefId: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTelegramAuth: () => void;
  onToggleMode: () => void;
  onShowForgotPassword: () => void;
}

const AuthDialog = ({
  open,
  onOpenChange,
  isRegister,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  phone,
  setPhone,
  selectedPreferences,
  togglePreference,
  isLoading,
  onSubmit,
  onTelegramAuth,
  onToggleMode,
  onShowForgotPassword
}: AuthDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isRegister ? 'Регистрация' : 'Вход'}
          </DialogTitle>
          <DialogDescription>
            {isRegister ? 'Создайте аккаунт для начала изучения' : 'Войдите в свой аккаунт'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Или</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onTelegramAuth}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <Icon name="Send" size={20} className="mr-2" />
          Войти через Telegram
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-primary hover:underline block w-full"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
          {!isRegister && (
            <button
              type="button"
              onClick={onShowForgotPassword}
              className="text-sm text-muted-foreground hover:text-primary block w-full"
            >
              Забыли пароль?
            </button>
          )}
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
  );
};

export default AuthDialog;