import Icon from '@/components/ui/icon';

interface Plan {
  tier: string;
  name: string;
  price: number;
  features: string[];
  color: string;
  popular?: boolean;
  isTest?: boolean;
}

interface PendingPaymentData {
  exists: boolean;
  tier?: string;
  transaction_id?: string;
  created_at?: string;
  redirect_url?: string;
}

interface SubscriptionPlansProps {
  currentTier: string;
  isPaymentLoading: boolean;
  pendingPayment: PendingPaymentData;
  onSubscribe: (tier: string, price: number) => void;
  onCancelPayment: () => void;
}

const plans: Plan[] = [
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

export default function SubscriptionPlans({ currentTier, isPaymentLoading, pendingPayment, onSubscribe, onCancelPayment }: SubscriptionPlansProps) {
  const tierNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    unlimited: 'Unlimited'
  };

  return (
    <div id="plans">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Доступные тарифы</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map(plan => {
          const isCurrentPlan = currentTier === plan.tier;
          const isPendingForThisTier = pendingPayment.exists && pendingPayment.tier === plan.tier;
          
          return (
            <div 
              key={plan.tier}
              className={`relative border-2 rounded-2xl p-4 sm:p-8 transition-all ${
                isCurrentPlan 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-2xl md:scale-105' 
                  : isPendingForThisTier
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 shadow-2xl'
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
              ) : isPendingForThisTier ? (
                <div className="space-y-2">
                  <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon name="Loader2" size={16} className="animate-spin text-orange-600" />
                      <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                        Ожидаем оплату
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      {tierNames[plan.tier]} • {plan.price} ₽
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {pendingPayment.redirect_url && (
                      <button
                        onClick={() => window.open(pendingPayment.redirect_url, '_blank')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                      >
                        <Icon name="ExternalLink" size={14} />
                        <span>Продолжить</span>
                      </button>
                    )}
                    <button
                      onClick={onCancelPayment}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-1.5"
                    >
                      <Icon name="X" size={14} />
                      <span>Отменить</span>
                    </button>
                  </div>
                </div>
              ) : pendingPayment.exists ? (
                <button 
                  disabled
                  className="w-full bg-gray-400 dark:bg-gray-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold cursor-not-allowed"
                >
                  Оплата другого тарифа...
                </button>
              ) : (
                <button 
                  onClick={() => onSubscribe(plan.tier, plan.price)}
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
  );
}