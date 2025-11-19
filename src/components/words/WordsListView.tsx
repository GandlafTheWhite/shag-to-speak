import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import WordCard, { type Word } from './WordCard';
import AddWordDialogs from './AddWordDialogs';
import type { User } from '@/pages/Index';

interface WordsListViewProps {
  user: User;
  words: Word[];
  filteredWords: Word[];
  filterStatus: 'all' | 'learning' | 'done';
  setFilterStatus: (status: 'all' | 'learning' | 'done') => void;
  isLoading: boolean;
  newWord: string;
  setNewWord: (word: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isAiDialogOpen: boolean;
  setIsAiDialogOpen: (open: boolean) => void;
  isSetsDialogOpen: boolean;
  setIsSetsDialogOpen: (open: boolean) => void;
  onAddWord: () => void;
  onAiGenerate: () => void;
  onAddWordSet: (setId: string) => void;
  onStatusChange: (wordId: number, newStatus: 'learning' | 'done') => void;
  onDelete: (wordId: number) => void;
  onSelectWord: (word: Word | null) => void;
}

const WordsListView = ({
  user,
  filteredWords,
  filterStatus,
  setFilterStatus,
  isLoading,
  newWord,
  setNewWord,
  aiPrompt,
  setAiPrompt,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isAiDialogOpen,
  setIsAiDialogOpen,
  isSetsDialogOpen,
  setIsSetsDialogOpen,
  onAddWord,
  onAiGenerate,
  onAddWordSet,
  onStatusChange,
  onDelete,
  onSelectWord
}: WordsListViewProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Фильтр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все слова</SelectItem>
            <SelectItem value="learning">Изучаю</SelectItem>
            <SelectItem value="done">Выучил</SelectItem>
          </SelectContent>
        </Select>

        <AddWordDialogs
          user={user}
          newWord={newWord}
          setNewWord={setNewWord}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          isLoading={isLoading}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          isAiDialogOpen={isAiDialogOpen}
          setIsAiDialogOpen={setIsAiDialogOpen}
          isSetsDialogOpen={isSetsDialogOpen}
          setIsSetsDialogOpen={setIsSetsDialogOpen}
          onAddWord={onAddWord}
          onAiGenerate={onAiGenerate}
          onAddWordSet={onAddWordSet}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          <span className="ml-3 text-lg text-muted-foreground">Загрузка слов...</span>
        </div>
      )}

      {!isLoading && filteredWords.length === 0 && (
        <div className="text-center py-12">
          <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-2">Словарь пуст</p>
          <p className="text-sm text-muted-foreground">Добавьте первые слова для изучения</p>
        </div>
      )}

      {!isLoading && filteredWords.length > 0 && (
        <div className="grid gap-4">
          {filteredWords.map((word) => (
            <WordCard 
              key={word.id}
              word={word}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onSelectWord={onSelectWord}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredWords.length === 0 && filterStatus !== 'all' && (
        <Card className="text-center py-12">
          <CardContent>
            <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {`Нет слов в категории "${filterStatus === 'learning' ? 'Изучаю' : 'Выучил'}"`}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default WordsListView;
