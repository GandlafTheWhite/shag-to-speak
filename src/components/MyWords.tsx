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
import CorrectionSuggestionsDialog from './words/CorrectionSuggestionsDialog';
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
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [pendingCorrections, setPendingCorrections] = useState<Array<{ original: string; suggestions: Array<{ word: string; translation: string; confidence: string }> }>>([]);
  const [currentCorrectionIndex, setCurrentCorrectionIndex] = useState(0);
  const [correctionDecisions, setCorrectionDecisions] = useState<Record<string, string>>({});
  const [isProcessingCorrection, setIsProcessingCorrection] = useState(false);
  const [enrichedDataCache, setEnrichedDataCache] = useState<any>(null);
  const [pendingWordsInput, setPendingWordsInput] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadWords();
  }, []);



  const loadWords = async () => {
    try {
      setIsLoading(true);
      console.log('Loading words...');
      const apiWords = await apiClient.getWords();
      console.log(`Loaded ${apiWords.length} words from API`);
      
      const wordsToDisplay = apiWords.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: false
      }));
      
      setWords(wordsToDisplay);
      updateUser({ word_count: wordsToDisplay.length });
    } catch (error) {
      console.error('Error loading words:', error);
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

  const handleAddWord = async () => {
    if (!newWord.trim()) return;

    const wordsToAdd = newWord.split(',').map(w => w.trim()).filter(w => w);

    try {
      setIsLoading(true);
      
      const checkResponse = await fetch('https://functions.poehali.dev/d87144a4-ac34-4dce-bdf8-449ebd85b759', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ words: wordsToAdd, check_only: true })
      });

      if (!checkResponse.ok) {
        throw new Error('Не удалось проверить слова');
      }

      const checkData = await checkResponse.json();
      
      if (checkData.corrections && checkData.corrections.length > 0) {
        const correctionsWithSuggestions = checkData.corrections.filter(
          (c: any) => c.suggestions && c.suggestions.length > 0
        );
        
        if (correctionsWithSuggestions.length > 0) {
          setPendingCorrections(correctionsWithSuggestions);
          setCurrentCorrectionIndex(0);
          setCorrectionDecisions({});
          setEnrichedDataCache(checkData.enriched_data);
          setPendingWordsInput(wordsToAdd);
          setIsLoading(false);
          return;
        }
      }
      
      const result = await apiClient.addWords(wordsToAdd);
      
      const newWords = result.words.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: false
      }));
      
      setWords([...newWords, ...words]);
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

  const handleWordSelect = (selectedWord: string) => {
    const current = pendingCorrections[currentCorrectionIndex];
    setIsProcessingCorrection(true);
    setCorrectionDecisions(prev => ({ ...prev, [current.original]: selectedWord }));
    
    setTimeout(() => {
      setIsProcessingCorrection(false);
      if (currentCorrectionIndex < pendingCorrections.length - 1) {
        setCurrentCorrectionIndex(currentCorrectionIndex + 1);
      } else {
        finalizeCorrectedWords();
      }
    }, 300);
  };

  const handleSkipWord = () => {
    const current = pendingCorrections[currentCorrectionIndex];
    
    const updatedWordsInput = pendingWordsInput.filter(w => w !== current.original);
    setPendingWordsInput(updatedWordsInput);
    
    if (currentCorrectionIndex < pendingCorrections.length - 1) {
      setCurrentCorrectionIndex(currentCorrectionIndex + 1);
    } else {
      if (updatedWordsInput.length > 0) {
        finalizeCorrectedWords();
      } else {
        setPendingCorrections([]);
        setCurrentCorrectionIndex(0);
        setCorrectionDecisions({});
        setEnrichedDataCache(null);
        setPendingWordsInput([]);
        setIsLoading(false);
        toast({
          title: 'Отменено',
          description: 'Добавление слов отменено'
        });
      }
    }
  };

  const finalizeCorrectedWords = async () => {
    try {
      setIsLoading(true);
      
      const finalWords = pendingWordsInput.map(word => 
        correctionDecisions[word] || word
      );
      
      const updatedEnrichedData: any = {};
      
      for (const originalWord of pendingWordsInput) {
        const selectedWord = correctionDecisions[originalWord] || originalWord;
        
        if (correctionDecisions[originalWord] && correctionDecisions[originalWord] !== originalWord) {
          const correctedEnrichment = await fetchEnrichmentForWord(correctionDecisions[originalWord]);
          updatedEnrichedData[correctedEnrichment.corrected_word] = {
            ...correctedEnrichment,
            was_corrected: false
          };
        } else if (enrichedDataCache[originalWord]) {
          updatedEnrichedData[selectedWord] = {
            ...enrichedDataCache[originalWord],
            corrected_word: selectedWord,
            was_corrected: false
          };
        }
      }
      
      const result = await apiClient.addWords(finalWords, updatedEnrichedData);
      
      const newWords = result.words.map(w => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: false
      }));
      
      setWords([...newWords, ...words]);
      updateUser({ word_count: words.length + result.count });
      setNewWord('');
      setIsAddDialogOpen(false);
      
      setPendingCorrections([]);
      setCurrentCorrectionIndex(0);
      setCorrectionDecisions({});
      setEnrichedDataCache(null);
      setPendingWordsInput([]);
      setIsProcessingCorrection(false);
      
      if (result.count > 0) {
        toast({
          title: 'Слова добавлены!',
          description: `Добавлено ${result.count} ${result.count === 1 ? 'слово' : 'слов'}`
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
      setIsProcessingCorrection(false);
    }
  };

  const fetchEnrichmentForWord = async (word: string): Promise<any> => {
    try {
      const response = await fetch('https://functions.poehali.dev/d87144a4-ac34-4dce-bdf8-449ebd85b759', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ words: [word], check_only: true })
      });

      if (response.ok) {
        const data = await response.json();
        const wordLower = word.toLowerCase();
        const enrichment = data.enriched_data[wordLower] || data.enriched_data[word];
        
        if (enrichment) {
          return enrichment;
        }
        
        return {
          corrected_word: wordLower,
          was_corrected: false,
          suggestions: [],
          translation: '...',
          examples: ['Example'],
          category: 'uncategorized',
          transcription: '',
          part_of_speech: 'noun',
          difficulty_level: 'intermediate',
          example_sentence: `This is an example with ${word}.`
        };
      }
    } catch (error) {
      console.error('Failed to fetch enrichment:', error);
    }
    
    return {
      corrected_word: word,
      was_corrected: false,
      suggestions: [],
      translation: '...',
      examples: ['Example'],
      category: 'uncategorized',
      transcription: '',
      part_of_speech: 'noun',
      difficulty_level: 'intermediate',
      example_sentence: `This is an example with ${word}.`
    };
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
      
      const newWords = result.words.map((w: any) => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: false
      }));
      
      setWords([...newWords, ...words]);
      
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
      
      const newWords = result.words.map((w: ApiWord) => ({
        id: w.id,
        english_word: w.english_word,
        russian_translation: w.russian_translation,
        examples: w.examples,
        status: w.status,
        recall_count: w.recall_count,
        category: w.category || 'uncategorized',
        is_generating: false
      }));
      
      setWords([...newWords, ...words]);
      
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

  const handleCategorizeWords = async () => {
    try {
      setIsCategorizing(true);
      const result = await apiClient.categorizeWords();
      
      await loadWords();
      
      toast({
        title: 'Рассортировка завершена!',
        description: result.message
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось рассортировать слова',
        variant: 'destructive'
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center max-w-full">
          <div className="flex items-center gap-2">
            <Button variant="default" size="default" onClick={() => onNavigate('dashboard')} className="bg-primary hover:bg-primary/90">
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-display font-bold ml-2">Мой словарь</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl animate-fade-in">
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
              isCategorizing={isCategorizing}
              onCategoryClick={handleCategoryClick}
              onCategorizeWords={handleCategorizeWords}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CorrectionSuggestionsDialog
        corrections={pendingCorrections}
        currentIndex={currentCorrectionIndex}
        onWordSelect={handleWordSelect}
        onSkipWord={handleSkipWord}
        isOpen={pendingCorrections.length > 0 && currentCorrectionIndex < pendingCorrections.length}
        isProcessing={isProcessingCorrection}
      />
    </div>
  );
};

export default MyWords;