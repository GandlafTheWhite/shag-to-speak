import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import WordSetsDialog from '../WordSetsDialog';
import type { User } from '@/pages/Index';

interface AddWordDialogsProps {
  user: User;
  newWord: string;
  setNewWord: (word: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isLoading: boolean;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isAiDialogOpen: boolean;
  setIsAiDialogOpen: (open: boolean) => void;
  isSetsDialogOpen: boolean;
  setIsSetsDialogOpen: (open: boolean) => void;
  onAddWord: () => void;
  onAiGenerate: () => void;
  onAddWordSet: (setId: string) => void;
}

const AddWordDialogs = ({
  user,
  newWord,
  setNewWord,
  aiPrompt,
  setAiPrompt,
  isLoading,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isAiDialogOpen,
  setIsAiDialogOpen,
  isSetsDialogOpen,
  setIsSetsDialogOpen,
  onAddWord,
  onAiGenerate,
  onAddWordSet
}: AddWordDialogsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 md:flex-none">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить слова
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новые слова</DialogTitle>
            <DialogDescription>
              Введите слова через запятую. Перевод и примеры будут сгенерированы автоматически.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="words">Слова</Label>
              <Input
                id="words"
                placeholder="например: serendipity, embrace, resilient"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
            </div>
            <Button onClick={onAddWord} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Добавление...
                </>
              ) : (
                'Добавить'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="flex-1 md:flex-none">
            <Icon name="Sparkles" size={18} className="mr-2" />
            Попросить ИИ
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ИИ добавит слова за вас</DialogTitle>
            <DialogDescription>
              Какие слова вы хотите добавить? После вашего запроса ИИ добавит 15 слов в ваш словарь.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Ваш запрос</Label>
              <Input
                id="ai-prompt"
                placeholder="например: слова для путешествий или деловая лексика"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
              <Icon name="Info" size={16} className="inline mr-2" />
              ИИ подберёт 15 английских слов с переводами и примерами по вашему запросу
            </div>
            <Button onClick={onAiGenerate} className="w-full" disabled={isLoading || !aiPrompt.trim()}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Генерация слов...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={18} className="mr-2" />
                  Сгенерировать слова
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        className="flex-1 md:flex-none"
        onClick={() => setIsSetsDialogOpen(true)}
      >
        <Icon name="Package" size={18} className="mr-2" />
        Наборы
      </Button>

      <WordSetsDialog
        open={isSetsDialogOpen}
        onOpenChange={setIsSetsDialogOpen}
        user={user}
        onAddSet={onAddWordSet}
      />
    </div>
  );
};

export default AddWordDialogs;
