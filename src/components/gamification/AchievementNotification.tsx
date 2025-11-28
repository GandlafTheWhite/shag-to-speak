import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Achievement } from './AchievementBadge';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
    }`}>
      <Card className="border-2 border-primary shadow-2xl max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-3xl animate-bounce">
              {achievement.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Trophy" size={16} className="text-primary" />
                <p className="text-xs font-semibold text-primary uppercase">Достижение разблокировано!</p>
              </div>
              
              <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
              
              <div className="flex items-center gap-2">
                <Icon name="Star" size={14} className="text-yellow-500" />
                <span className="text-xs font-medium text-yellow-500">+{achievement.points} баллов</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="h-6 w-6 p-0"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementNotification;
