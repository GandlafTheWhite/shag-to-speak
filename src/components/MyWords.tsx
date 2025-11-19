import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { apiClient, type Word as ApiWord } from '@/utils/api';
import { CATEGORIES } from '@/data/categories';
import WordsListView from './words/WordsListView';
import WordsCategoriesView from './words/WordsCategoriesView';
import { type Word } from './words/WordCard';

interface MyWordsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  updateUser: (data: Partial<User>) => void;
}

const MyWords = ({ user, onNavigate, updateUser }: MyWordsProps) => {
  const [words, setWords] = useState<Word[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'categories'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'learning' | 'done'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
        recall_count: w.recall_count,
        category: w.category || 'uncategorized'
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

  const filteredWords = words.filter(w => {
    const statusMatch = filterStatus === 'all' || w.status === filterStatus;
    const categoryMatch = selectedCategory === 'all' || w.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  const wordsByCategory = words.reduce((acc, word) => {
    const category = word.category || 'uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(word);
    return acc;
  }, {} as Record<string, Word[]>);

  const categoriesWithWords = CATEGORIES.filter(cat => 
    wordsByCategory[cat.id] && wordsByCategory[cat.id].length > 0
  );

  const generateWordDetailsInBackground = async (wordId: number) => {
    try {
      const updatedWord = await apiClient.generateWordDetails(wordId);
      
      setWords(prevWords => prevWords.map(w => 
        w.id === wordId ? {
          ...updatedWord,
          is_generating: false
        } : w
      ));
    } catch (error) {
      console.error('Failed to generate word details:', error);
      setWords(prevWords => prevWords.map(w => 
        w.id === wordId ? {
          ...w,
          russian_translation: 'Ошибка генерации',
          examples: ['Попробуйте удалить и добавить слово заново'],
          is_generating: false
        } : w
      ));
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;

    const wordsToAdd = newWord.split(',').map(w => w.trim()).filter(w => w);

    try {
      setIsLoading(true);
      const result = await apiClient.addWords(wordsToAdd);
      
      const newWords = result.words.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: w.is_generating || false
      }));
      
      setWords([...newWords, ...words]);
      
      updateUser({ word_count: words.length + result.count });
      setNewWord('');
      setIsAddDialogOpen(false);
      
      newWords.forEach(word => {
        if (word.is_generating) {
          generateWordDetailsInBackground(word.id);
        }
      });
      
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
        recall_count: w.recall_count,
        category: w.category || 'uncategorized'
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
        recall_count: w.recall_count,
        category: w.category || 'uncategorized'
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

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('list');
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
        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="list">
              <Icon name="List" size={18} className="mr-2" />
              Списком
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              По категориям
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <WordsListView
              user={user}
              words={words}
              filteredWords={filteredWords}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              isLoading={isLoading}
              newWord={newWord}
              setNewWord={setNewWord}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              isAddDialogOpen={isAddDialogOpen}
              setIsAddDialogOpen={setIsAddDialogOpen}
              isAiDialogOpen={isAiDialogOpen}
              setIsAiDialogOpen={setIsAiDialogOpen}
              isSetsDialogOpen={isSetsDialogOpen}
              setIsSetsDialogOpen={setIsSetsDialogOpen}
              onAddWord={handleAddWord}
              onAiGenerate={handleAiGenerate}
              onAddWordSet={handleAddWordSet}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSelectWord={setSelectedWord}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <WordsCategoriesView
              categoriesWithWords={categoriesWithWords}
              wordsByCategory={wordsByCategory}
              isLoading={isLoading}
              onCategoryClick={handleCategoryClick}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyWords;