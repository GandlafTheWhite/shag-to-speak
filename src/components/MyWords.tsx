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



const MyWords = ({ user, onNavigate, updateUser }: MyWordsProps) => {
  const [words, setWords] = useState<Word[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'learning' | 'done'>('all');
  const [newWord, setNewWord] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSetsDialogOpen, setIsSetsDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setIsLoading(true);
      const apiWords = await apiClient.getWords();
      const validWords = apiWords.filter(w => 
        w.russian_translation !== 'перевод генерируется...' &&
        !(w.examples.length === 1 && w.examples[0] === 'Примеры будут добавлены')
      );
      setWords(validWords.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })));
      updateUser({ word_count: validWords.length });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить слова',
        variant: 'destructive'
      });
      setWords([]);
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
      
      if (result.count > 0) {
        const description = result.message 
          ? `Добавлено ${result.count} ${result.count === 1 ? 'слово' : 'слов'}. ${result.message}`
          : `Добавлено ${result.count} ${result.count === 1 ? 'слово' : 'слов'}`;
        
        toast({
          title: 'Слова добавлены!',
          description
        });
      } else if (result.message) {
        toast({
          title: 'Информация',
          description: result.message
        });
      }
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
    try {
      setIsLoading(true);
      const response = await fetch(`https://functions.poehali.dev/a50df754-52e7-423a-a83b-fe50339a4d73`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ set_id: setId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add word set');
      }

      const result = await response.json();
      
      setWords([...result.words.map((w: any) => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })), ...words]);
      
      updateUser({ word_count: words.length + result.count });
      
      const description = result.message 
        ? `Добавлено ${result.count} слов. ${result.message}`
        : `Добавлено ${result.count} слов из набора`;
      
      toast({
        title: 'Набор добавлен!',
        description
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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch('https://functions.poehali.dev/f2e3df61-25fc-4fad-b66c-a5f08c97df77', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          count: 15
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось сгенерировать слова');
      }

      const result = await response.json();
      
      setWords([...result.words.map((w: ApiWord) => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count
      })), ...words]);
      
      updateUser({ word_count: words.length + result.count });
      setAiPrompt('');
      setIsAiDialogOpen(false);
      
      toast({
        title: 'Слова добавлены!',
        description: `ИИ добавил ${result.count} слов по вашему запросу`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сгенерировать слова',
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
                  <Button onClick={handleAddWord} className="w-full" disabled={isLoading}>
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
                  <Button onClick={handleAiGenerate} className="w-full" disabled={isLoading || !aiPrompt.trim()}>
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
          </div>
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