import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TrialOfferModal from '@/components/TrialOfferModal';
import SubscriptionSuccessModal from '@/components/SubscriptionSuccessModal';
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';
import SubscriptionBanners from '@/components/subscription/SubscriptionBanners';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import ProcessingPaymentBanner from '@/components/subscription/ProcessingPaymentBanner';
import type { User } from '@/pages/Index';

interface SubscriptionLimits {
  words_added: { used: number; limit: number; remaining: number };
  word_sets_added: { used: number; limit: number; remaining: number };
  exercises_completed: { used: number; limit: number; remaining: number };
  status_changes: { used: number; limit: number; remaining: number };
}

interface PendingPayment {
  exists: boolean;
  tier?: string;
  transaction_id?: string;
  created_at?: string;
}

interface SubscriptionData {
  tier: string;
  status: string;
  is_trial: boolean;
  trial_days_left: number;
  subscription_end_date: string | null;
  can_activate_trial?: boolean;
  pending_payment: PendingPayment;
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
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const tier = urlParams.get('tier');
    
    if (paymentStatus === 'success' && tier) {
      setPurchasedTier(tier);
      setIsSuccessModalOpen(true);
      
      const newUrl = window.location.pathname + '?page=subscription';
      window.history.replaceState({}, '', newUrl);
    }
    
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (subscription?.pending_payment?.exists) {
      const interval = setInterval(() => {
        fetchSubscription();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [subscription?.pending_payment?.exists]);

  useEffect(() => {
    if (subscription && !subscription.pending_payment?.exists && subscription.status === 'active') {
      const urlParams = new URLSearchParams(window.location.search);
      const wasProcessing = urlParams.get('payment') === 'success';
      
      if (wasProcessing && !isSuccessModalOpen) {
        const tier = urlParams.get('tier');
        if (tier) {
          setPurchasedTier(tier);
          setIsSuccessModalOpen(true);
        }
      }
    }
  }, [subscription?.pending_payment?.exists, subscription?.status]);

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

  const handleCancelPayment = async () => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) {
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=cancel_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchSubscription();
      }
    } catch (err) {
      console.error('Cancel payment failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SubscriptionHeader onNavigate={onNavigate} />
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
        <SubscriptionHeader onNavigate={onNavigate} />
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

  return (
    <div className="min-h-screen">
      <SubscriptionHeader onNavigate={onNavigate} />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-6xl">
        {subscription.pending_payment?.exists && subscription.pending_payment.tier && subscription.pending_payment.created_at && (
          <ProcessingPaymentBanner 
            tier={subscription.pending_payment.tier}
            createdAt={subscription.pending_payment.created_at}
          />
        )}

        <SubscriptionBanners 
          subscription={subscription}
          onOpenTrialModal={() => setIsTrialModalOpen(true)}
        />

        <SubscriptionStatus subscription={subscription} />

        <SubscriptionPlans 
          currentTier={subscription.tier}
          isPaymentLoading={isPaymentLoading}
          pendingPayment={subscription.pending_payment || { exists: false }}
          onSubscribe={handleSubscribe}
          onCancelPayment={handleCancelPayment}
        />

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