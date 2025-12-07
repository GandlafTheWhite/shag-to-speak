import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import PhraseCard from './PhraseCard';
import type { Sentence } from '@/types/sentence';

interface PhrasesListViewProps {
  phrases: Sentence[];
  onAddPhrase: (phraseText: string) => Promise<void>;
  onDeletePhrase: (phraseId: number) => void;
  isLoading: boolean;
}

const PhrasesListView = ({ phrases, onAddPhrase, onDeletePhrase, isLoading }: PhrasesListViewProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPhrase, setNewPhrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (newPhrase.trim()) {
      try {
        setIsSubmitting(true);
        await onAddPhrase(newPhrase);
        setNewPhrase('');
        setIsAddDialogOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Мои фразы</h2>
          <p className="text-sm text-muted-foreground">
            Сохраняй полезные выражения и идиомы
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить фразу
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-3 text-primary animate-spin" />
          <p className="text-muted-foreground">Загрузка фраз...</p>
        </Card>
      ) : phrases.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="MessageSquare" size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Пока нет сохранённых фраз</p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
            Добавить первую фразу
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {phrases.map(phrase => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              onDelete={onDeletePhrase}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить фразу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Фраза на английском
              </label>
              <Textarea
                placeholder="Например: break the ice, how are you doing, it's a piece of cake"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Перевод будет добавлен автоматически
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={!newPhrase.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Добавление...
                </>
              ) : (
                'Добавить'
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhrasesListView;
