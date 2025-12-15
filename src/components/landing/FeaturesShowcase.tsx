import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const FeaturesShowcase = () => {
  const features = [
    {
      icon: 'Sparkles',
      title: 'AI-обработка слов',
      description: 'Записывайте слова и фразы — AI автоматически создаёт переводы с контекстом и примерами использования',
      visual: (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="ArrowRight" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Serendipity</span>
              <p className="text-muted-foreground text-xs">Счастливая случайность, неожиданная удача</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground italic pl-6">
            "Finding that book was pure serendipity"
          </div>
        </div>
      )
    },
    {
      icon: 'BookOpen',
      title: 'Личный словарь',
      description: 'Сохраняйте слова в персональный словарь с транскрипцией, переводами и примерами для эффективного изучения',
      visual: (
        <div className="mt-4 space-y-2">
          {['Travel', 'Business', 'Daily Life'].map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded border text-sm">
              <Icon name="Folder" size={16} className="text-accent" />
              <span className="font-medium">{cat}</span>
              <span className="ml-auto text-xs text-muted-foreground">{8 - idx * 2} слов</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: 'RefreshCw',
      title: 'Адаптивное изучение',
      description: 'Система создаёт уникальные упражнения на основе ваших интересов с адаптивным повторением для долгосрочного запоминания',
      visual: (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Icon name="Target" size={16} className="text-primary" />
              Упражнение дня
            </span>
            <span className="text-xs text-muted-foreground">Персонализировано</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Перевод</span>
              <span className="font-medium">✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Контекст</span>
              <span className="font-medium">✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Составление</span>
              <span className="font-medium">✓</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: 'TrendingUp',
      title: 'Умная аналитика',
      description: 'Отслеживайте прогресс изучения со статистикой словарного запаса, графиками роста и персональными достижениями',
      visual: (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Прогресс за неделю</span>
            <span className="text-xs text-accent font-bold">+12 слов</span>
          </div>
          <div className="flex gap-1 h-16 items-end">
            {[40, 65, 45, 80, 60, 90, 75].map((height, idx) => (
              <div 
                key={idx} 
                className="flex-1 bg-primary/70 rounded-t transition-all hover:bg-primary"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Пн</span>
            <span>Вс</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4">
            Возможности платформы
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Технологичные инструменты для эффективного изучения английского
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards] hover:border-primary/50 group overflow-hidden"
              style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                  <Icon name={feature.icon as any} size={28} className="text-primary" />
                </div>
                <CardTitle className="font-display text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feature.visual}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
