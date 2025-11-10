import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import WordSetsDialog from './WordSetsDialog';
import { WORD_SETS } from '@/data/wordSets';
import { apiClient, type Word as ApiWord } from '@/utils/api';

interface MyWordsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  updateUser: (data: Partial<User>) => void;
}

interface Word {
  id: number;
  english_word: string;
  russian_translation: string;
  examples: string[];
  status: 'learning' | 'done';
  recall_count: number;
}

const MOCK_WORDS: Word[] = [
  {
    id: 1,
    english_word: 'serendipity',
    russian_translation: 'счастливая случайность',
    examples: [
      'It was pure serendipity that we met at the coffee shop.',
      'The discovery was a moment of serendipity.',
      'Serendipity played a role in their success.'
    ],
    status: 'learning',
    recall_count: 3
  },
  {
    id: 2,
    english_word: 'embrace',
    russian_translation: 'принимать, обнимать',
    examples: [
      'We should embrace new challenges.',
      'She embraced her friend warmly.',
      'The company embraced digital transformation.'
    ],
    status: 'learning',
    recall_count: 5
  },
  {
    id: 3,
    english_word: 'resilient',
    russian_translation: 'стойкий, устойчивый',
    examples: [
      'She proved to be resilient in difficult times.',
      'The city is resilient after the storm.',
      'Building resilient systems is crucial.'
    ],
    status: 'done',
    recall_count: 10
  }
];

const MyWords = ({ user, onNavigate, updateUser }: MyWordsProps) => {
  const [words, setWords] = useState<Word[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'learning' | 'done'>('all');
  const [newWord, setNewWord] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSetsDialogOpen, setIsSetsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setIsLoading(true);
      const apiWords = await apiClient.getWords();
      setWords(apiWords.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })));
      updateUser({ word_count: apiWords.length });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить слова',
        variant: 'destructive'
      });
      setWords(MOCK_WORDS);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWords = words.filter(w => 
    filterStatus === 'all' ? true : w.status === filterStatus
  );

  const handleAddWord = async () => {
    if (!newWord.trim()) return;

    const wordsToAdd = newWord.split(',').map(w => w.trim()).filter(w => w);

    try {
      setIsLoading(true);
      const result = await apiClient.addWords(wordsToAdd);
      
      setWords([...result.words.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })), ...words]);
      
      updateUser({ word_count: words.length + result.count });
      setNewWord('');
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Слова добавлены!',
        description: `Добавлено ${result.count} ${result.count === 1 ? 'слово' : 'слов'}`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить слова',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (wordId: number, newStatus: 'learning' | 'done') => {
    try {
      await apiClient.updateWordStatus(wordId, newStatus);
      setWords(words.map(w => w.id === wordId ? { ...w, status: newStatus } : w));
      toast({
        title: 'Статус обновлен',
        description: `Слово переведено в "${newStatus === 'learning' ? 'Изучаю' : 'Выучил'}"`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = (wordId: number) => {
    setWords(words.filter(w => w.id !== wordId));
    updateUser({ word_count: words.length - 1 });
    setSelectedWord(null);
    toast({
      title: 'Слово удалено',
      description: 'Слово удалено из словаря'
    });
  };

  const handleAddWordSet = async (setId: string) => {
    const set = WORD_SETS.find(s => s.id === setId);
    if (!set) return;

    try {
      setIsLoading(true);
      const result = await apiClient.addWords(set.words);
      
      setWords([...result.words.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })), ...words]);
      
      updateUser({ word_count: words.length + result.count });
      
      toast({
        title: 'Набор добавлен!',
        description: `Добавлено ${result.count} слов из набора "${set.title}"`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить набор',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-display font-bold">Мой словарь</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
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

          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
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
                  <Button onClick={handleAddWord} className="w-full">
                    Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => setIsSetsDialogOpen(true)}
            >
              <Icon name="Package" size={18} className="mr-2" />
              Наборы слов
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredWords.map((word) => (
            <Card key={word.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-display text-xl mb-2">
                      {word.english_word}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {word.russian_translation}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={word.status === 'done' ? 'default' : 'secondary'}>
                      {word.status === 'learning' ? '📖 Изучаю' : '✅ Выучил'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {word.recall_count} повторений
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Примеры:</p>
                    <ul className="space-y-1">
                      {word.examples.map((ex, idx) => (
                        <li key={idx} className="text-sm text-foreground pl-4 relative before:content-['•'] before:absolute before:left-0">
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(word.id, word.status === 'learning' ? 'done' : 'learning')}
                    >
                      <Icon name={word.status === 'learning' ? 'Check' : 'RotateCcw'} size={16} className="mr-1" />
                      {word.status === 'learning' ? 'Выучил' : 'Вернуть'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedWord(word)}>
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Удалить слово?</DialogTitle>
                          <DialogDescription>
                            Вы уверены, что хотите удалить "{word.english_word}" из словаря?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setSelectedWord(null)}>
                            Отмена
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(word.id)}>
                            Удалить
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {filterStatus === 'all' 
                  ? 'Словарь пуст. Добавьте первые слова!' 
                  : `Нет слов в категории "${filterStatus === 'learning' ? 'Изучаю' : 'Выучил'}"`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <WordSetsDialog
        open={isSetsDialogOpen}
        onOpenChange={setIsSetsDialogOpen}
        user={user}
        onAddSet={handleAddWordSet}
      />
    </div>
  );
};

export default MyWords;