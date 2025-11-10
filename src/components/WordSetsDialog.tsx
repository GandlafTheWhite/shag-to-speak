import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { WORD_SETS } from '@/data/wordSets';
import { LEARNING_TOPICS } from '@/data/topics';
import type { User } from '@/pages/Index';

interface WordSetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onAddSet: (setId: string) => void;
}

const WordSetsDialog = ({ open, onOpenChange, user, onAddSet }: WordSetsDialogProps) => {
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const relevantSets = WORD_SETS.filter(set => 
    user.preferences.includes(set.topic)
  );

  const otherSets = WORD_SETS.filter(set => 
    !user.preferences.includes(set.topic)
  );

  const handleSelectSet = (setId: string) => {
    onAddSet(setId);
    setSelectedSet(null);
    onOpenChange(false);
  };

  const getTopicLabel = (topicId: string) => {
    return LEARNING_TOPICS.find(t => t.id === topicId)?.label || topicId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Наборы слов</DialogTitle>
          <DialogDescription>
            Выберите готовый набор для быстрого добавления 50 слов по теме
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {relevantSets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                <Icon name="Star" size={20} className="text-primary" />
                Рекомендовано для вас
              </h3>
              <div className="grid gap-3">
                {relevantSets.map((set) => (
                  <Card 
                    key={set.id} 
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => handleSelectSet(set.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{set.title}</CardTitle>
                          <CardDescription>{set.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary">{getTopicLabel(set.topic)}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {set.wordCount || set.words.length} слов
                            </span>
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {otherSets.length > 0 && (
            <div>
              <h3 className="text-lg font-display font-semibold mb-3">Все наборы</h3>
              <div className="grid gap-3">
                {otherSets.map((set) => (
                  <Card 
                    key={set.id} 
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => handleSelectSet(set.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{set.title}</CardTitle>
                          <CardDescription>{set.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline">{getTopicLabel(set.topic)}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {set.wordCount || set.words.length} слов
                            </span>
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WordSetsDialog;