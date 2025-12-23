import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SubscriptionHeaderProps {
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings' | 'achievements') => void;
}

export default function SubscriptionHeader({ onNavigate }: SubscriptionHeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
        <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">
          ShagToSpeak
        </h1>
        <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
      </div>
    </header>
  );
}
