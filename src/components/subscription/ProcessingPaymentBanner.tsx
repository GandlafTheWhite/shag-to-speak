import Icon from '@/components/ui/icon';

interface ProcessingPaymentBannerProps {
  tier: string;
  createdAt: string;
}

const tierNames: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  unlimited: 'Unlimited'
};

export default function ProcessingPaymentBanner({ tier, createdAt }: ProcessingPaymentBannerProps) {
  const tierName = tierNames[tier] || tier;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  
  let timeText = '';
  if (secondsAgo < 60) {
    timeText = 'только что';
  } else if (secondsAgo < 120) {
    timeText = '1 минуту назад';
  } else {
    const minutesAgo = Math.floor(secondsAgo / 60);
    timeText = `${minutesAgo} ${minutesAgo < 5 ? 'минуты' : 'минут'} назад`;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl mb-8 shadow-lg animate-pulse">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <Icon name="Loader2" size={32} className="animate-spin" />
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold">Обрабатываем ваш платёж...</h3>
            <p className="text-white/90 text-sm sm:text-base">
              Тариф <span className="font-semibold">{tierName}</span> • Оплата {timeText}
            </p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Это займёт несколько секунд. Тариф обновится автоматически ✨
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
