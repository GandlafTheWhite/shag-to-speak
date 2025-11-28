import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { LEARNING_TOPICS } from '@/data/topics';

interface ProfileSetupWizardProps {
  open: boolean;
  userId: number;
  initialName: string;
  onComplete: (data: { name: string; email: string; phone: string; preferences: string[] }) => void;
  isLoading: boolean;
}

const ProfileSetupWizard = ({ open, userId, initialName, onComplete, isLoading }: ProfileSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  const togglePreference = (prefId: string) => {
    setPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      return;
    }
    setStep(step + 1);
  };

  const handleSkipEmail = () => {
    setEmail('');
    setStep(3);
  };

  const handleSkipPhone = () => {
    setPhone('');
    setStep(4);
  };

  const handleSkipPreferences = () => {
    setPreferences([]);
    handleComplete();
  };

  const handleComplete = () => {
    onComplete({ name, email, phone, preferences });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-2 w-12 rounded-full transition-colors ${
            s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            Привет, Путник! 🚀
          </DialogTitle>
          <DialogDescription className="text-center">
            Осталось совсем немного
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Icon name="User" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Укажи имя</h3>
                <p className="text-sm text-muted-foreground">Как к тебе обращаться?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Введите ваше имя" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full" 
                size="lg"
                disabled={!name.trim()}
              >
                Продолжить
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Icon name="Mail" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Укажи свою почту</h3>
                <p className="text-sm text-muted-foreground">Для восстановления доступа и уведомлений</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleNext} 
                  className="flex-1" 
                  size="lg"
                  disabled={!email.trim() || !email.includes('@')}
                >
                  Продолжить
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </div>
              <Button 
                onClick={handleSkipEmail} 
                variant="ghost" 
                className="w-full text-muted-foreground"
                size="sm"
              >
                Я не хочу указывать свою почту
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Icon name="Phone" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Укажи свой номер телефона</h3>
                <p className="text-sm text-muted-foreground">Для связи и дополнительной безопасности</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+7 (999) 123-45-67" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full" 
                size="lg"
                disabled={!phone.trim()}
              >
                Продолжить
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
              <Button 
                onClick={handleSkipPhone} 
                variant="ghost" 
                className="w-full text-muted-foreground"
                size="sm"
              >
                Я не хочу указывать свой номер телефона
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Icon name="Target" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Настрой свои предпочтения</h3>
                <p className="text-sm text-muted-foreground">Выбери темы для изучения</p>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto p-2 border rounded-lg">
                {LEARNING_TOPICS.map((topic) => (
                  <div key={topic.id} className="flex items-start space-x-3 p-2 hover:bg-accent/50 rounded transition-colors">
                    <Checkbox 
                      id={topic.id}
                      checked={preferences.includes(topic.id)}
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
              <Button 
                onClick={handleComplete} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Начать обучение'}
                <Icon name="Rocket" size={20} className="ml-2" />
              </Button>
              <Button 
                onClick={handleSkipPreferences} 
                variant="ghost" 
                className="w-full text-muted-foreground"
                size="sm"
                disabled={isLoading}
              >
                Я укажу свои предпочтения позже
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupWizard;
