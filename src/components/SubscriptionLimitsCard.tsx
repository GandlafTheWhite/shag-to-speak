import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
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
  subscription_end_date: string | null;
  limits: SubscriptionLimits;
}

const PAYMENT_URL = 'https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7';

interface SubscriptionLimitsCardProps {
  user: User;
}

export default function SubscriptionLimitsCard({ user }: SubscriptionLimitsCardProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = async () => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) return;
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    setLoading(true);
    try {
      const response = await fetch(`${PAYMENT_URL}?action=status`, {
        headers: { 'X-User-Id': userId }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !subscription) {
      fetchSubscription();
    }
  }, [isOpen]);

  const getPeriodEndDate = () => {
    if (!subscription?.subscription_end_date) return null;
    const date = new Date(subscription.subscription_end_date);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const tierNames: Record<string, string> = {
    none: 'Нет подписки',
    trial: 'Пробный (Basic)',
    basic: 'Basic',
    pro: 'Pro',
    unlimited: 'Unlimited'
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-0 hover:bg-transparent h-auto"
            >
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Icon name="BarChart3" size={20} className="text-primary" />
                Мои лимиты подписки
              </CardTitle>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-muted-foreground transition-transform"
              />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin text-primary" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Тариф:</span>
                    <span className="font-semibold">{tierNames[subscription.tier] || subscription.tier}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Статус:</span>
                    <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {subscription.status === 'active' ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  {getPeriodEndDate() && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Лимиты актуальны до:</span>
                      <span className="font-semibold">{getPeriodEndDate()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
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
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Icon name={icon as any} size={16} className="text-primary" />
                            {label}
                          </span>
                          <span className="font-semibold">
                            {limit.used} / {isUnlimited ? '∞' : limit.limit}
                          </span>
                        </div>
                        <Progress 
                          value={isUnlimited ? 100 : percentage}
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>

                {subscription.status !== 'active' && (
                  <Button 
                    onClick={() => navigate('/subscription')}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    <Icon name="Sparkles" size={18} className="mr-2" />
                    Продлить подписку
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Не удалось загрузить данные
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}