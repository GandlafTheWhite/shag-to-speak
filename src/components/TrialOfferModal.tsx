import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TrialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrialActivated?: () => void;
}

const PAYMENT_URL = 'https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7';

export default function TrialOfferModal({ isOpen, onClose, onTrialActivated }: TrialOfferModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateTrial = async () => {
    const userDataStr = localStorage.getItem('shagtospeak_user');
    
    if (!userDataStr) {
      setError('Необходимо войти в систему');
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id?.toString();
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=activate_trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Ошибка активации триала');
      }
      
      if (onTrialActivated) {
        onTrialActivated();
      }
      
      onClose();
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (err) {
      console.error('Trial activation failed:', err);
      setError(err instanceof Error ? err.message : 'Попробуйте позже');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSubscription = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Icon name="Sparkles" size={32} className="text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Попробуй бесплатно!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Активируй пробный период на 7 дней и получи полный доступ ко всем возможностям Basic тарифа
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Gift" size={20} className="text-blue-500" />
              Что входит в триал:
            </h4>
            <ul className="space-y-2">
              {[
                { icon: 'Plus', text: '60 слов в месяц' },
                { icon: 'Package', text: '4 набора слов' },
                { icon: 'Zap', text: '20 упражнений' },
                { icon: 'Edit', text: '10 изменений статуса' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Icon name={item.icon as any} size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleActivateTrial}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Активация...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={20} className="mr-2" />
                Активировать триал
              </>
            )}
          </Button>

          <Button 
            onClick={handleGoToSubscription}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <Icon name="CreditCard" size={18} className="mr-2" />
            Посмотреть все тарифы
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">
          Без привязки карты • Отмена в любое время
        </p>
      </DialogContent>
    </Dialog>
  );
}
