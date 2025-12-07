import { apiClient, type Word as ApiWord } from '@/utils/api';
import { type Word } from '../words/WordCard';
import type { User } from '@/pages/Index';

export const useWordActions = (
  user: User,
  words: Word[],
  setWords: (words: Word[]) => void,
  updateUser: (data: Partial<User>) => void,
  newWord: string,
  setNewWord: (word: string) => void,
  setIsAddDialogOpen: (open: boolean) => void,
  aiPrompt: string,
  setAiPrompt: (prompt: string) => void,
  setIsAiDialogOpen: (open: boolean) => void,
  setSelectedWord: (word: Word | null) => void,
  setIsLoading: (loading: boolean) => void,
  setIsCategorizing: (categorizing: boolean) => void,
  loadWords: () => Promise<void>,
  viewMode: 'list' | 'categories',
  setViewMode: (mode: 'list' | 'categories') => void,
  setSelectedCategory: (category: string) => void,
  toast: any,
  setPendingCorrections: (corrections: any[]) => void,
  setCurrentCorrectionIndex: (index: number) => void,
  setCorrectionDecisions: (decisions: Record<string, string>) => void,
  setEnrichedDataCache: (cache: any) => void,
  setPendingWordsInput: (words: string[]) => void
) => {
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

  return {
    handleAddWord,
    handleStatusChange,
    handleDelete,
    handleAddWordSet,
    handleAiGenerate,
    handleCategoryClick,
    handleCategorizeWords
  };
};
