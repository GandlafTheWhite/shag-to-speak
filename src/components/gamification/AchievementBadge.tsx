import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export interface Achievement {
  id: number;
  achievement_code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  total?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  const { unlocked, icon, name, description, points, progress, total } = achievement;

  return (
    <Card className={`transition-all ${unlocked ? 'border-primary shadow-md' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex items-center justify-center w-16 h-16 rounded-full text-3xl ${
            unlocked ? 'bg-primary/10' : 'bg-muted grayscale'
          }`}>
            {icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-sm">{name}</h3>
              {unlocked && (
                <Icon name="CheckCircle2" size={16} className="text-primary" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            
            <div className="flex items-center gap-2">
              <Icon name="Star" size={14} className="text-yellow-500" />
              <span className="text-xs font-medium text-yellow-500">+{points} баллов</span>
            </div>
            
            {!unlocked && progress !== undefined && total !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Прогресс</span>
                  <span>{progress} / {total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${Math.min((progress / total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadge;
