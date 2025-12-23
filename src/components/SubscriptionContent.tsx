import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TrialOfferModal from '@/components/TrialOfferModal';
import SubscriptionSuccessModal from '@/components/SubscriptionSuccessModal';
import type { User } from '@/pages/Index';

interface SubscriptionLimits {
  words_added: { used: number; limit: number; remaining: number };
  word_sets_added: { used: number; limit: number; remaining: number };
  exercises_completed: { used: number; limit: number; remaining: number };
  status_changes: { used: number; limit: number; remaining: number };
}

interface SubscriptionData {
  tier: string;
  status: string;
  is_trial: boolean;
  trial_days_left: number;
  subscription_end_date: string | null;
  can_activate_trial?: boolean;
  limits: SubscriptionLimits;
  available_plans: Array<{ tier: string; price: number }>;
}

const PAYMENT_URL = 'https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7';

interface SubscriptionContentProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings' | 'achievements') => void;
}

export default function SubscriptionContent({ user, onNavigate }: SubscriptionContentProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<string>('');

  useEffect(() => {
    // Проверяем URL на наличие payment=success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const tier = urlParams.get('tier');
    
    if (paymentStatus === 'success' && tier) {
      setPurchasedTier(tier);
      setIsSuccessModalOpen(true);
      
      // Очищаем URL от параметров оплаты
      const newUrl = window.location.pathname + '?page=subscription';
      window.history.replaceState({}, '', newUrl);
    }
    
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) {
      setError('Не найден ID пользователя. Пожалуйста, войдите в систему.');
      setLoading(false);
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=status`, {
        headers: { 'X-User-Id': userId }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSubscription(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string, price: number) => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) {
      alert('Необходимо войти в систему');
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    setIsPaymentLoading(true);
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ tier })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('Не получена ссылка для оплаты');
      }
    } catch (err) {
      console.error('Payment creation failed:', err);
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Попробуйте позже'}`);
      setIsPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
            <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
              ShagToSpeak
            </h1>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>
        </header>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
            <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
              ShagToSpeak
            </h1>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" size={64} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-6">{error || 'Не удалось загрузить данные подписки'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchSubscription} variant="default">
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Попробовать снова
              </Button>
              <Button onClick={() => onNavigate('dashboard')} variant="outline">
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const plans = [
    { 
      tier: 'test', 
      name: 'Тест', 
      price: 10, 
      features: [
        'Тестовый платёж',
        'Не активирует подписку',
        'Только для проверки'
      ],
      color: 'from-gray-400 to-gray-600',
      isTest: true
    },
    { 
      tier: 'basic', 
      name: 'Basic', 
      price: 399, 
      features: [
        '60 слов в месяц',
        '4 набора слов (по 15 шт)',
        '20 упражнений',
        '10 сортировок'
      ],
      color: 'from-blue-400 to-blue-600'
    },
    { 
      tier: 'pro', 
      name: 'Pro', 
      price: 799, 
      features: [
        '150 слов в месяц',
        '10 наборов слов',
        '50 упражнений',
        '20 сортировок'
      ],
      color: 'from-purple-400 to-purple-600',
      popular: true
    },
    { 
      tier: 'unlimited', 
      name: 'Unlimited', 
      price: 1499, 
      features: [
        'Безлимит слов',
        'Безлимит наборов',
        'Безлимит упражнений',
        'Безлимит сортировок'
      ],
      color: 'from-pink-400 to-pink-600'
    }
  ];

  const tierNames: Record<string, string> = {
    none: 'Нет подписки',
    trial: 'Триал (Basic)',
    basic: 'Basic',
    pro: 'Pro',
    unlimited: 'Unlimited'
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
          <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
            ShagToSpeak
          </h1>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-6xl">
        {((subscription.tier === 'none' || (subscription.tier === 'trial' && subscription.status !== 'active')) && subscription.can_activate_trial) && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Icon name="Gift" size={32} />
                <div>
                  <h3 className="text-xl font-bold">Активируй бесплатный пробный период!</h3>
                  <p className="text-white/90">7 дней полного доступа к Basic тарифу</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTrialModalOpen(true)}
                className="bg-white text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap"
              >
                <Icon name="Sparkles" size={18} className="inline mr-2" />
                Активировать триал
              </button>
            </div>
          </div>
        )}
        
        {subscription.is_trial && subscription.status === 'active' && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Icon name="Sparkles" size={32} />
                <div>
                  <h3 className="text-xl font-bold">Пробный период активен!</h3>
                  <p className="text-white/90">Осталось {subscription.trial_days_left} {subscription.trial_days_left === 1 ? 'день' : subscription.trial_days_left < 5 ? 'дня' : 'дней'}</p>
                </div>
              </div>
              <button 
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                Выбрать тариф
              </button>
            </div>
          </div>
        )}

        {subscription.status === 'expired' && subscription.tier !== 'trial' && subscription.tier !== 'none' && (
          <div className="bg-red-500 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center gap-4">
              <Icon name="AlertCircle" size={32} />
              <div>
                <h3 className="text-xl font-bold">Подписка истекла</h3>
                <p className="text-white/90">Продлите доступ для продолжения работы с платформой</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-card rounded-2xl shadow-xl p-4 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Icon name="CreditCard" size={24} className="text-blue-500 sm:w-8 sm:h-8" />
            Моя подписка
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl gap-2">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Текущий тариф:</span>
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  {(subscription.tier === 'trial' && subscription.status !== 'active') || subscription.tier === 'none' 
                    ? 'Нет подписки' 
                    : tierNames[subscription.tier]}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-xl gap-2">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Статус:</span>
                <span className={`text-lg sm:text-xl font-bold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {(subscription.tier === 'trial' && subscription.status !== 'active') || subscription.tier === 'none'
                    ? 'Не активирована'
                    : subscription.status === 'active' ? 'Активна' : 'Истекла'}
                </span>
              </div>
              
              {subscription.subscription_end_date && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl gap-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Действует до:</span>
                  <span className="text-base sm:text-lg font-semibold text-purple-600">
                    {new Date(subscription.subscription_end_date).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                <Icon name="Activity" size={18} className="text-blue-500 sm:w-5 sm:h-5" />
                Использование лимитов:
              </h3>
              
              {[
                { key: 'words_added', label: 'Добавление слов', icon: 'Plus' },
                { key: 'word_sets_added', label: 'Наборы слов', icon: 'Package' },
                { key: 'exercises_completed', label: 'Упражнения', icon: 'Zap' },
                { key: 'status_changes', label: 'Сортировки', icon: 'ArrowUpDown' }
              ].map(({ key, label, icon }) => {
                const limit = subscription.limits[key as keyof SubscriptionLimits];
                const percentage = limit.limit > 0 ? Math.min((limit.used / limit.limit) * 100, 100) : 0;
                const isUnlimited = limit.limit === -1;
                
                return (
                  <div key={key} className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <Icon name={icon as any} size={14} className="text-blue-500 sm:w-4 sm:h-4" />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="font-semibold whitespace-nowrap ml-2">
                        {limit.used} / {isUnlimited ? '∞' : limit.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <div 
                        className={`h-2 sm:h-2.5 rounded-full transition-all ${
                          percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: isUnlimited ? '100%' : `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="plans">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Доступные тарифы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map(plan => {
              const isCurrentPlan = subscription.tier === plan.tier;
              
              return (
                <div 
                  key={plan.tier}
                  className={`relative border-2 rounded-2xl p-4 sm:p-8 transition-all ${
                    isCurrentPlan 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-2xl md:scale-105' 
                      : plan.popular
                      ? 'border-purple-300 shadow-xl hover:shadow-2xl md:hover:scale-105'
                      : 'border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl md:hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        Популярный
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
                    <Icon name="Zap" size={24} className="text-white sm:w-8 sm:h-8" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price} ₽</span>
                    <span className="text-sm sm:text-base text-muted-foreground">/мес</span>
                  </div>
                  
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3">
                        <Icon name="Check" size={16} className="text-green-500 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrentPlan ? (
                    <button 
                      disabled
                      className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold cursor-not-allowed"
                    >
                      Текущий тариф
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan.tier, plan.price)}
                      disabled={isPaymentLoading}
                      className={`w-full bg-gradient-to-r ${plan.color} text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {isPaymentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Открываем оплату...</span>
                        </>
                      ) : (
                        'Выбрать'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Все тарифы автоматически продлеваются каждый месяц</p>
          <p className="mt-2">Вы можете отменить подписку в любое время</p>
        </div>
      </main>

      <TrialOfferModal 
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onTrialActivated={() => {
          fetchSubscription();
        }}
      />

      <SubscriptionSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          fetchSubscription();
        }}
        tier={purchasedTier}
      />
    </div>
  );
}