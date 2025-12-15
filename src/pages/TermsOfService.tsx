import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Пользовательское соглашение</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold">Пользовательское соглашение</h2>
              <p className="text-sm text-muted-foreground">Последнее обновление: 15 августа 2024</p>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose dark:prose-invert max-w-none">
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Общие положения</h3>
                <p className="mb-2">
                  <strong>1.1.</strong> Настоящее Пользовательское соглашение (далее — «Соглашение») является юридически обязательным документом, регулирующим порядок использования сервиса (далее — «Сервис»).
                </p>
                <p>
                  <strong>1.2.</strong> Используя Сервис, Пользователь подтверждает полное согласие с условиями Соглашения. Если Пользователь не согласен с условиями, он обязан немедленно прекратить использование Сервиса.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2. Отказ от ответственности</h3>
                <p className="mb-2">
                  <strong>2.1.</strong> Сервис предоставляется «как есть» («AS IS»). Администрация не даёт никаких гарантий, явных или подразумеваемых, в том числе относительно работоспособности, безопасности, соответствия ожиданиям или пригодности для конкретных целей.
                </p>
                <p className="mb-2">
                  <strong>2.2.</strong> Администрация не несёт ответственности за:
                </p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>любые убытки (включая потерю прибыли, данных, репутации), возникшие в результате использования или невозможности использования Сервиса;</li>
                  <li>действия или бездействие третьих лиц;</li>
                  <li>содержание, законность, качество, достоверность товаров, услуг или информации, полученных через Сервис;</li>
                  <li>технические сбои, ошибки, задержки в работе или недоступность Сервиса.</li>
                </ul>
                <p>
                  <strong>2.3.</strong> Все риски, связанные с использованием Сервиса, полностью возлагаются на Пользователя.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">3. Ограничения</h3>
                <p className="mb-2">
                  <strong>3.1.</strong> Пользователь обязуется самостоятельно оценивать законность своих действий при использовании Сервиса.
                </p>
                <p className="mb-2">
                  <strong>3.2.</strong> Запрещено использовать Сервис для деятельности, противоречащей применимому законодательству.
                </p>
                <p className="mb-2">
                  <strong>3.3.</strong> Администрация вправе в любой момент, без уведомления и объяснения причин:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>ограничить или заблокировать доступ Пользователя к Сервису;</li>
                  <li>удалить любую информацию;</li>
                  <li>приостановить или прекратить работу Сервиса полностью или частично.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">4. Конфиденциальность</h3>
                <p className="mb-2">
                  <strong>4.1.</strong> Администрация может собирать минимальный объём технических данных, необходимых для работы Сервиса.
                </p>
                <p>
                  <strong>4.2.</strong> Администрация не гарантирует полную безопасность или анонимность передаваемых данных.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5. Изменения в соглашении</h3>
                <p className="mb-2">
                  <strong>5.1.</strong> Администрация имеет право в одностороннем порядке изменять условия Соглашения в любое время без предварительного уведомления.
                </p>
                <p>
                  <strong>5.2.</strong> Продолжение использования Сервиса после внесения изменений означает согласие Пользователя с новыми условиями.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6. Применимое право</h3>
                <p>
                  <strong>6.1.</strong> Все вопросы и споры, связанные с использованием Сервиса, регулируются законодательством юрисдикции, определяемой Администрацией.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">7. Условия возврата</h3>
                <p className="mb-2">
                  <strong>7.1.</strong> Так как Сервис предоставляет цифровые товары и/или услуги нематериального характера, возврат и обмен после их предоставления невозможен.
                </p>
                <p className="mb-2">
                  <strong>7.2.</strong> Возврат средств может быть осуществлён только в случаях:
                </p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>если услуга не была оказана по техническим причинам со стороны Сервиса;</li>
                  <li>если доступ к цифровому товару не был предоставлен Пользователю.</li>
                </ul>
                <p className="mb-2">
                  <strong>7.3.</strong> Для оформления возврата Пользователь обязан обратиться в службу поддержки Сервиса в течение 24 часов с момента оплаты, указав номер заказа и контактные данные.
                </p>
                <p>
                  <strong>7.4.</strong> Решение о возврате средств принимается Администрацией индивидуально в каждом случае.
                </p>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  Начиная использование Сервиса (в том числе, регистрируясь или создавая аккаунт), Пользователь подтверждает, что ознакомлен с настоящим Соглашением и безусловно принимает его условия, даже если фактически не прочитал его.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
