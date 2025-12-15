import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import YinYangButton from '@/components/ui/YinYangButton';
import FeaturesShowcase from './FeaturesShowcase';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface LandingPageContentProps {
  onShowModeDialog: () => void;
}

const LandingPageContent = ({ onShowModeDialog }: LandingPageContentProps) => {


  return (
    <>
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background z-0"></div>
        
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onShowModeDialog}
            className="font-medium"
          >
            Войти
          </Button>
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 relative z-10 max-w-full">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight break-words px-4">
                Технологичное решение для изучения и менеджмента английских слов с применением AI
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 leading-relaxed break-words px-4 max-w-4xl mx-auto">
                Персонализация • Умная аналитика • Контекстный перевод • Личный словарь • Автоматическое разбиение категорий
              </p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] py-8">
              <YinYangButton onClick={onShowModeDialog} />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] flex items-center gap-6 justify-center text-sm text-muted-foreground flex-wrap px-4">
              <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Icon name="Check" size={18} className="text-accent" />
                <span>Бесплатно</span>
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Icon name="Check" size={18} className="text-accent" />
                <span>Без карты</span>
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Icon name="Check" size={18} className="text-accent" />
                <span>50 слов бесплатно</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesShowcase />

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="text-center mb-8 sm:mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] [animation-delay:0.1s]">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4 break-words px-2">
              Как это работает
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground px-2 break-words">
              Три простых шага к изучению английского
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-0 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]"></div>
            
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
              <Card 
                key={idx} 
                className="relative z-10 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards] group hover:border-primary/50"
                style={{ animationDelay: `${0.3 + idx * 0.15}s` }}
              >
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
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

      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/20 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] [animation-delay:0.2s]">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Начните свой путь сегодня
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Бесплатный тариф включает 50 слов и 3 упражнения в день — более чем достаточно, чтобы начать
          </p>
          
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 shadow-xl hover:shadow-2xl transition-all hover:scale-110 transform animate-pulse hover:animate-none"
            onClick={onShowModeDialog}
          >
            Попробовать бесплатно
            <Icon name="Rocket" size={24} className="ml-3" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <button 
              className="text-primary hover:underline font-medium"
              onClick={onShowModeDialog}
            >
              Войти
            </button>
          </p>
        </div>
      </section>

      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 ShagToSpeak. Все права защищены.
            </div>
            <div className="flex gap-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                Политика конфиденциальности
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPageContent;