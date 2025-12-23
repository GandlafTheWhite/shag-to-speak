import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
}

const tierInfo: Record<string, { name: string; features: string[] }> = {
  basic: {
    name: 'Basic',
    features: ['60 слов в месяц', '4 набора слов', '20 упражнений', '10 сортировок']
  },
  pro: {
    name: 'Pro',
    features: ['150 слов в месяц', '10 наборов слов', '50 упражнений', '20 сортировок']
  },
  unlimited: {
    name: 'Unlimited',
    features: ['Безлимит слов', 'Безлимит наборов', 'Безлимит упражнений', 'Безлимит сортировок']
  },
  test: {
    name: 'Тест',
    features: ['Тестовый платёж выполнен успешно', 'Подписка не активирована']
  }
};

export default function SubscriptionSuccessModal({ isOpen, onClose, tier }: SubscriptionSuccessModalProps) {
  if (!isOpen) return null;

  const info = tierInfo[tier] || tierInfo.basic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300 delay-100">
            <Icon name="Check" size={40} className="text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {tier === 'test' ? 'Тест успешен!' : 'Поздравляем! 🎉'}
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6">
            {tier === 'test' 
              ? 'Тестовый платёж прошёл успешно'
              : `Вы оформили подписку ${info.name}`}
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 sm:p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide">
              {tier === 'test' ? 'Информация' : 'Доступные функции'}
            </h3>
            <ul className="space-y-2">
              {info.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Icon 
                    name={tier === 'test' ? 'Info' : 'Check'} 
                    size={18} 
                    className={`flex-shrink-0 mt-0.5 ${tier === 'test' ? 'text-gray-500' : 'text-green-600 dark:text-green-400'}`}
                  />
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl text-base sm:text-lg font-bold shadow-lg"
          >
            {tier === 'test' ? 'Понятно' : 'Ура! Начинаем путь'}
          </Button>
        </div>
      </div>
    </div>
  );
}
