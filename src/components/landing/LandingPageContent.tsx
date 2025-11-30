import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LandingPageContentProps {
  onShowModeDialog: () => void;
}

const LandingPageContent = ({ onShowModeDialog }: LandingPageContentProps) => {
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
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background z-0"></div>
        
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 relative z-10 max-w-full">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center md:text-left opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm">
                <span className="text-primary font-medium text-sm">Путь важнее цели ✨</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 break-words">
                ShagToSpeak
              </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed break-words">
                Изучайте английский шаг за шагом. Добавляйте слова, выполняйте упражнения и наслаждайтесь процессом.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 transform w-full sm:w-auto"
                  onClick={onShowModeDialog}
                >
                  Начать бесплатно
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 justify-center md:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>Бесплатно</span>
                </div>
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>Без карты</span>
                </div>
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Icon name="Check" size={18} className="text-green-500" />
                  <span>50 слов</span>
                </div>
              </div>
            </div>

            <div className="relative opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] hidden md:block">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center transition-transform hover:scale-105 duration-500">
                <img 
                  src="https://cdn.poehali.dev/projects/a751abad-be5b-4dc6-8136-de83f53c7858/files/28f73409-8d94-4085-b102-3b333ea7590b.jpg" 
                  alt="Learning Journey Path with Nature" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-accent/30">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="text-center mb-8 sm:mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] [animation-delay:0.1s]">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4 break-words px-2">
              Почему ShagToSpeak?
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2 break-words">
              Мы создали инструмент, который делает изучение английского приятным и эффективным
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards] hover:border-primary/50 group"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
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
    </>
  );
};

export default LandingPageContent;