import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PointsDisplayProps {
  totalPoints: number;
  recentPoints?: number;
}

const PointsDisplay = ({ totalPoints, recentPoints }: PointsDisplayProps) => {
  const getLevelInfo = (points: number) => {
    if (points < 100) return { level: 1, nextLevel: 100, title: 'Новичок' };
    if (points < 500) return { level: 2, nextLevel: 500, title: 'Ученик' };
    if (points < 1000) return { level: 3, nextLevel: 1000, title: 'Практик' };
    if (points < 2500) return { level: 4, nextLevel: 2500, title: 'Знаток' };
    if (points < 5000) return { level: 5, nextLevel: 5000, title: 'Эксперт' };
    return { level: 6, nextLevel: 10000, title: 'Мастер' };
  };

  const levelInfo = getLevelInfo(totalPoints);
  const progress = (totalPoints / levelInfo.nextLevel) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
              <Icon name="Trophy" size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего баллов</p>
              <p className="text-3xl font-bold text-yellow-500">
                {totalPoints}
                {recentPoints && recentPoints > 0 && (
                  <span className="text-sm text-green-500 ml-2">+{recentPoints}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Уровень</p>
            <p className="text-2xl font-bold">{levelInfo.level}</p>
            <p className="text-xs text-muted-foreground">{levelInfo.title}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Прогресс до уровня {levelInfo.level + 1}</span>
            <span>{totalPoints} / {levelInfo.nextLevel}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;
