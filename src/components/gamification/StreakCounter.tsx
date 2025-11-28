import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakCounter = ({ currentStreak, longestStreak }: StreakCounterProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10">
              <Icon name="Flame" size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Текущая серия</p>
              <p className="text-3xl font-bold text-orange-500">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">
                {currentStreak === 1 ? 'день' : currentStreak < 5 ? 'дня' : 'дней'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Рекорд</p>
            <p className="text-xl font-semibold text-muted-foreground">{longestStreak}</p>
          </div>
        </div>
        
        {currentStreak > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {currentStreak >= 7 
                ? '🎉 Отличная серия! Продолжай в том же духе!' 
                : `Занимайся ещё ${7 - currentStreak} ${7 - currentStreak === 1 ? 'день' : 'дня'} подряд для разблокировки достижения`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
