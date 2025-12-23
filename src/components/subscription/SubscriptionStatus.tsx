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
  can_activate_trial?: boolean;
  limits: SubscriptionLimits;
  available_plans: Array<{ tier: string; price: number }>;
}

interface SubscriptionStatusProps {
  subscription: SubscriptionData;
}

const tierNames: Record<string, string> = {
  none: 'Нет подписки',
  trial: 'Триал (Basic)',
  basic: 'Basic',
  pro: 'Pro',
  unlimited: 'Unlimited'
};

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  return (
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
  );
}
