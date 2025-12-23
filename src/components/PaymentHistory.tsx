import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { User } from '@/pages/Index';

interface Transaction {
  id: number;
  transaction_id: string;
  tier: string;
  amount: number;
  status: string;
  payment_method: number;
  created_at: string;
  confirmed_at: string | null;
  redirect_url: string | null;
}

interface PaymentHistoryProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings' | 'achievements' | 'subscription') => void;
}

const PAYMENT_URL = 'https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7';

const tierNames: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  unlimited: 'Unlimited',
  test: 'Тест'
};

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: 'Loader2' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: 'CheckCircle2' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: 'XCircle' },
  CANCELED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: 'Ban' },
  EXPIRED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', icon: 'Clock' }
};

const statusNames: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  COMPLETED: 'Оплачен',
  FAILED: 'Ошибка',
  CANCELED: 'Отменён',
  EXPIRED: 'Истёк'
};

export default function PaymentHistory({ user, onNavigate }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) {
      setError('Не найден ID пользователя');
      setLoading(false);
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=payment_history`, {
        headers: { 'X-User-Id': userId }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTransactions(data.transactions || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoading(false);
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
            <Button variant="ghost" size="sm" onClick={() => onNavigate('subscription')}>
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

  if (error) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
            <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
              ShagToSpeak
            </h1>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('subscription')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" size={64} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchHistory} variant="default">
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
          <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
            ShagToSpeak
          </h1>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('subscription')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <Icon name="Receipt" size={28} className="text-blue-500" />
            История платежей
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Все ваши транзакции и их статусы
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="FileText" size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              История пуста
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              У вас пока нет транзакций
            </p>
            <Button onClick={() => onNavigate('subscription')} variant="default">
              <Icon name="CreditCard" size={18} className="mr-2" />
              Выбрать тариф
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const statusStyle = statusColors[transaction.status] || statusColors.PENDING;
              const createdDate = new Date(transaction.created_at);
              const confirmedDate = transaction.confirmed_at ? new Date(transaction.confirmed_at) : null;

              return (
                <div
                  key={transaction.id}
                  className="bg-white dark:bg-card rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold">
                          {tierNames[transaction.tier] || transaction.tier}
                        </h3>
                        <div className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5`}>
                          <Icon name={statusStyle.icon as any} size={14} className={transaction.status === 'PENDING' ? 'animate-spin' : ''} />
                          {statusNames[transaction.status] || transaction.status}
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Icon name="Calendar" size={14} />
                          Создан: {createdDate.toLocaleString('ru-RU')}
                        </p>
                        {confirmedDate && (
                          <p className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={14} />
                            Подтверждён: {confirmedDate.toLocaleString('ru-RU')}
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-xs opacity-70">
                          <Icon name="Hash" size={12} />
                          ID: {transaction.transaction_id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {transaction.amount} ₽
                      </div>
                      
                      {transaction.status === 'PENDING' && transaction.redirect_url && (
                        <button
                          onClick={() => window.open(transaction.redirect_url!, '_blank')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition flex items-center gap-2"
                        >
                          <Icon name="ExternalLink" size={16} />
                          Продолжить оплату
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
