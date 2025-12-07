import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/utils/api';
import { CATEGORIES } from '@/data/categories';
import { type Word } from '../words/WordCard';
import type { User } from '@/pages/Index';

export const useMyWordsData = (user: User, updateUser: (data: Partial<User>) => void) => {
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

  return {
    words,
    setWords,
    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    selectedCategory,
    setSelectedCategory,
    newWord,
    setNewWord,
    selectedWord,
    setSelectedWord,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isSetsDialogOpen,
    setIsSetsDialogOpen,
    isAiDialogOpen,
    setIsAiDialogOpen,
    aiPrompt,
    setAiPrompt,
    isLoading,
    setIsLoading,
    isCategorizing,
    setIsCategorizing,
    loadWords,
    filteredWords,
    wordsByCategory,
    categoriesWithWords,
    toast
  };
};
