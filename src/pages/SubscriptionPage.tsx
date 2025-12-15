import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

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
  limits: SubscriptionLimits;
  available_plans: Array<{ tier: string; price: number }>;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7?action=status', {
        headers: { 'X-User-Id': localStorage.getItem('user_id') || '' }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string, price: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('user_id') || ''
        },
        body: JSON.stringify({ tier })
      });
      
      const data = await response.json();
      
      alert(`⚠️ Заглушка оплаты\n\nТариф: ${tier}\nСумма: ${price}₽\nТранзакция: ${data.transaction_id}\n\n${data.message}`);
    } catch (error) {
      console.error('Payment creation failed:', error);
      alert('Ошибка создания платежа. Попробуйте позже.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
          <p>Ошибка загрузки данных подписки</p>
        </div>
      </div>
    );
  }

  const plans = [
    { 
      tier: 'basic', 
      name: 'Basic', 
      price: 399, 
      features: [
        '60 слов в месяц',
        '4 набора слов (по 15 шт)',
        '20 упражнений',
        '10 изменений статуса'
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
        '20 изменений статуса'
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
        'Безлимит изменений'
      ],
      color: 'from-pink-400 to-pink-600'
    }
  ];

  const tierNames: Record<string, string> = {
    trial: 'Триал (Basic)',
    basic: 'Basic',
    pro: 'Pro',
    unlimited: 'Unlimited'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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

        {subscription.status === 'expired' && (
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

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Icon name="CreditCard" size={32} className="text-blue-500" />
            Моя подписка
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-gray-600">Текущий тариф:</span>
                <span className="text-xl font-bold text-blue-600">{tierNames[subscription.tier]}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-gray-600">Статус:</span>
                <span className={`text-xl font-bold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {subscription.status === 'active' ? 'Активна' : 'Истекла'}
                </span>
              </div>
              
              {subscription.subscription_end_date && (
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <span className="text-gray-600">Действует до:</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {new Date(subscription.subscription_end_date).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Icon name="Activity" size={20} />
                Использование лимитов:
              </h3>
              
              {[
                { key: 'words_added', label: 'Добавление слов', icon: 'Plus' },
                { key: 'word_sets_added', label: 'Наборы слов', icon: 'Package' },
                { key: 'exercises_completed', label: 'Упражнения', icon: 'Zap' },
                { key: 'status_changes', label: 'Изменения', icon: 'Edit' }
              ].map(({ key, label, icon }) => {
                const limit = subscription.limits[key as keyof SubscriptionLimits];
                const percentage = limit.limit > 0 ? Math.min((limit.used / limit.limit) * 100, 100) : 0;
                const isUnlimited = limit.limit === -1;
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Icon name={icon as any} size={16} />
                        {label}
                      </span>
                      <span className="font-semibold">
                        {limit.used} / {isUnlimited ? '∞' : limit.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all ${
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
          <h2 className="text-3xl font-bold text-center mb-8">Доступные тарифы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const isCurrentPlan = subscription.tier === plan.tier;
              
              return (
                <div 
                  key={plan.tier}
                  className={`relative border-2 rounded-2xl p-8 transition-all ${
                    isCurrentPlan 
                      ? 'border-blue-500 bg-blue-50 shadow-2xl scale-105' 
                      : plan.popular
                      ? 'border-purple-300 shadow-xl hover:shadow-2xl hover:scale-105'
                      : 'border-gray-200 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        Популярный
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon name="Zap" size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price} ₽</span>
                    <span className="text-gray-600">/мес</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Icon name="Check" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrentPlan ? (
                    <button 
                      disabled
                      className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                      Текущий тариф
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan.tier, plan.price)}
                      className={`w-full bg-gradient-to-r ${plan.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg`}
                    >
                      Выбрать
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Все тарифы автоматически продлеваются каждый месяц</p>
          <p className="mt-2">Вы можете отменить подписку в любое время</p>
        </div>
      </div>
    </div>
  );
}
