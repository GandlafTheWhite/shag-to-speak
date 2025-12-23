import Icon from '@/components/ui/icon';

interface SubscriptionData {
  tier: string;
  status: string;
  is_trial: boolean;
  trial_days_left: number;
  subscription_end_date: string | null;
  can_activate_trial?: boolean;
}

interface SubscriptionBannersProps {
  subscription: SubscriptionData;
  onOpenTrialModal: () => void;
}

export default function SubscriptionBanners({ subscription, onOpenTrialModal }: SubscriptionBannersProps) {
  return (
    <>
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
              onClick={onOpenTrialModal}
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
    </>
  );
}
