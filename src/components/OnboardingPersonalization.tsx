import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from '@/components/ui/icon';

interface OnboardingPersonalizationProps {
  open: boolean;
  onComplete: (theme: 'light' | 'dark') => void;
}

const OnboardingPersonalization = ({ open, onComplete }: OnboardingPersonalizationProps) => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);

  const handleComplete = () => {
    setTheme(selectedTheme);
    onComplete(selectedTheme);
  };

  const themes = [
    {
      value: 'light' as const,
      name: 'Светлая',
      icon: 'Sun',
      preview: 'bg-gradient-to-br from-gray-50 to-blue-50',
      borderColor: 'border-gray-300'
    },
    {
      value: 'dark' as const,
      name: 'Тёмная',
      icon: 'Moon',
      preview: 'bg-gradient-to-br from-gray-900 to-blue-950',
      borderColor: 'border-gray-700'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">
            Настройте внешний вид
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Выберите тему оформления приложения
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-6">
          {themes.map((themeOption) => (
            <Card
              key={themeOption.value}
              className={`cursor-pointer transition-all duration-300 overflow-hidden hover:scale-105 ${
                selectedTheme === themeOption.value
                  ? 'ring-4 ring-primary shadow-xl'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedTheme(themeOption.value)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Icon name={themeOption.icon as any} size={28} className="text-primary" />
                  <h3 className="text-xl font-display font-bold">{themeOption.name}</h3>
                </div>

                <div 
                  className={`h-32 sm:h-40 rounded-lg border-2 ${themeOption.borderColor} ${themeOption.preview} flex items-center justify-center transition-all`}
                >
                  <div className="text-center space-y-2">
                    <div className={`text-sm font-medium ${themeOption.value === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Превью темы
                    </div>
                    {selectedTheme === themeOption.value && (
                      <div className="flex justify-center">
                        <Icon name="Check" size={32} className="text-primary animate-scale-in" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            onClick={handleComplete}
            className="px-12"
          >
            Продолжить
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingPersonalization;
