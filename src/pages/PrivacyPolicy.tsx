import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Политика конфиденциальности</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold">Политика конфиденциальности</h2>
              <p className="text-sm text-muted-foreground">Последнее обновление: 15 августа 2024</p>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose dark:prose-invert max-w-none">
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Общие положения</h3>
                <p className="mb-2">
                  <strong>1.1.</strong> Настоящая Политика конфиденциальности (далее — «Политика») регулирует порядок обработки и защиты информации, которую Пользователь передаёт при использовании сервиса (далее — «Сервис»).
                </p>
                <p>
                  <strong>1.2.</strong> Используя Сервис, Пользователь подтверждает своё согласие с условиями Политики. Если Пользователь не согласен с условиями — он обязан прекратить использование Сервиса.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2. Сбор информации</h3>
                <p className="mb-2">
                  <strong>2.1.</strong> Сервис может собирать следующие типы данных:
                </p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>идентификаторы аккаунта (логин, ID, никнейм и т.п.);</li>
                  <li>техническую информацию (IP-адрес, данные о браузере, устройстве и операционной системе);</li>
                  <li>историю взаимодействий с Сервисом.</li>
                </ul>
                <p>
                  <strong>2.2.</strong> Сервис не требует от Пользователя предоставления паспортных данных, документов, фотографий или другой личной информации, кроме минимально необходимой для работы.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">3. Использование информации</h3>
                <p className="mb-2">
                  <strong>3.1.</strong> Сервис может использовать полученную информацию исключительно для:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>обеспечения работы функционала;</li>
                  <li>связи с Пользователем (в том числе для уведомлений и поддержки);</li>
                  <li>анализа и улучшения работы Сервиса.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">4. Передача информации третьим лицам</h3>
                <p className="mb-2">
                  <strong>4.1.</strong> Администрация не передаёт полученные данные третьим лицам, за исключением случаев:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>если это требуется по закону;</li>
                  <li>если это необходимо для исполнения обязательств перед Пользователем (например, при работе с платёжными системами);</li>
                  <li>если Пользователь сам дал на это согласие.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5. Хранение и защита данных</h3>
                <p className="mb-2">
                  <strong>5.1.</strong> Данные хранятся в течение срока, необходимого для достижения целей обработки.
                </p>
                <p>
                  <strong>5.2.</strong> Администрация принимает разумные меры для защиты данных, но не гарантирует абсолютную безопасность информации при передаче через интернет.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6. Отказ от ответственности</h3>
                <p className="mb-2">
                  <strong>6.1.</strong> Пользователь понимает и соглашается, что передача информации через интернет всегда сопряжена с рисками.
                </p>
                <p>
                  <strong>6.2.</strong> Администрация не несёт ответственности за утрату, кражу или раскрытие данных, если это произошло по вине третьих лиц или самого Пользователя.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">7. Изменения в Политике</h3>
                <p className="mb-2">
                  <strong>7.1.</strong> Администрация вправе изменять условия Политики без предварительного уведомления.
                </p>
                <p>
                  <strong>7.2.</strong> Продолжение использования Сервиса после внесения изменений означает согласие Пользователя с новой редакцией Политики.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
