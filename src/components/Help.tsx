import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

interface HelpProps {
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
}

const Help = ({ onNavigate }: HelpProps) => {
  const faqs = [
    {
      question: 'Как добавить новые слова?',
      answer: 'Перейдите в раздел "Мой словарь", нажмите кнопку "Добавить слова" и введите слова через запятую. Перевод и примеры будут сгенерированы автоматически.'
    },
    {
      question: 'Какие типы упражнений доступны?',
      answer: 'Доступны упражнения на перевод (ввод перевода с клавиатуры) и множественный выбор (выбор правильного варианта из предложенных). Планируется добавление упражнений на синонимы/антонимы и составление предложений.'
    },
    {
      question: 'Сколько упражнений можно выполнить в день?',
      answer: 'На бесплатном тарифе доступно 3 упражнения в день. На Premium тарифе лимит упражнений не ограничен.'
    },
    {
      question: 'Какие ограничения у бесплатного тарифа?',
      answer: 'Бесплатный тариф ограничен 50 словами в словаре и 3 упражнениями в день. Премиум подписка (199 руб/мес) снимает все лимиты.'
    },
    {
      question: 'Как отметить слово как выученное?',
      answer: 'В разделе "Мой словарь" найдите нужное слово и нажмите кнопку "Выучил". Слово переместится в категорию "Выучил", но останется доступным для повторения.'
    },
    {
      question: 'Можно ли экспортировать свой словарь?',
      answer: 'Да, в разделе "Мои успехи" есть кнопка "Экспорт в Excel", которая позволяет скачать все ваши слова с переводами и примерами для резервной копии или использования в других приложениях.'
    },
    {
      question: 'Как выбрать темы для изучения?',
      answer: 'При регистрации вы выбираете интересующие вас темы (путешествия, бизнес, технологии и др.). Система будет приоритетно показывать слова из этих тем в упражнениях.'
    },
    {
      question: 'Что такое "философия пути"?',
      answer: 'Мы верим, что изучение языка — это путь, а не цель. Важнее наслаждаться процессом постепенного продвижения, чем гнаться за быстрыми результатами. Регулярность важнее интенсивности.'
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Помощь</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent border-primary/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageCircle" size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-1">
                    Нужна помощь?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Присоединяйтесь к нашему сообществу в Telegram
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full md:w-auto shadow-md hover:shadow-lg transition-all"
                onClick={() => window.open('https://t.me/+Tr9zf7kjYjwwYzZi', '_blank')}
              >
                <Icon name="Send" size={20} className="mr-2" />
                Открыть Telegram
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Icon name="HelpCircle" size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-3">
            Часто задаваемые вопросы
          </h2>
          <p className="text-muted-foreground text-lg">
            Найдите ответы на популярные вопросы
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display">FAQ</CardTitle>
            <CardDescription>Нажмите на вопрос, чтобы увидеть ответ</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Lightbulb" size={24} className="text-primary" />
                <CardTitle className="font-display">Советы по использованию</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Регулярно выполняйте упражнения для лучшего запоминания
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Добавляйте не только отдельные слова, но и целые фразы
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Используйте экспорт для создания резервных копий
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Изучайте слова в контексте примеров предложений
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Zap" size={24} className="text-primary" />
                <CardTitle className="font-display">Обратная связь</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Нашли ошибку или есть идея по улучшению? Мы будем рады вашим предложениям!
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open('https://t.me/+Tr9zf7kjYjwwYzZi', '_blank')}
              >
                <Icon name="MessageSquare" size={18} className="mr-2" />
                Отправить отзыв
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Icon name="Heart" size={28} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-display font-bold text-lg mb-2">
                  Философия ShagToSpeak
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Изучение языка — это путь, а не цель. Мы создали это приложение, чтобы помочь вам 
                  наслаждаться процессом изучения английского. Каждое новое слово — это маленькая 
                  победа, каждое упражнение — шаг вперед.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Не спешите, двигайтесь в своем темпе. Главное — регулярность и удовольствие от процесса. 
                  Путь к знанию английского может быть увлекательным приключением! ✨
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Help;