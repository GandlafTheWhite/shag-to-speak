import { useState } from 'react';
import { apiClient, type Word as ApiWord } from '@/utils/api';
import { type Word } from '../words/WordCard';
import type { User } from '@/pages/Index';

interface Suggestion {
  word: string;
  translation: string;
  confidence: string;
}

interface Correction {
  original: string;
  suggestions: Suggestion[];
}

export const useSpellCorrection = (
  user: User,
  words: Word[],
  setWords: (words: Word[]) => void,
  updateUser: (data: Partial<User>) => void,
  setNewWord: (word: string) => void,
  setIsAddDialogOpen: (open: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  toast: any
) => {
  const [pendingCorrections, setPendingCorrections] = useState<Correction[]>([]);
  const [currentCorrectionIndex, setCurrentCorrectionIndex] = useState(0);
  const [correctionDecisions, setCorrectionDecisions] = useState<Record<string, string>>({});
  const [isProcessingCorrection, setIsProcessingCorrection] = useState(false);
  const [enrichedDataCache, setEnrichedDataCache] = useState<any>(null);
  const [pendingWordsInput, setPendingWordsInput] = useState<string[]>([]);

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
          console.log('[SpellCorrection] Fetching enrichment for corrected word:', correctionDecisions[originalWord]);
          const correctedEnrichment = await fetchEnrichmentForWord(correctionDecisions[originalWord]);
          console.log('[SpellCorrection] Received enrichment:', correctedEnrichment);
          console.log('[SpellCorrection] Using key:', correctedEnrichment.corrected_word);
          updatedEnrichedData[correctedEnrichment.corrected_word] = {
            ...correctedEnrichment,
            was_corrected: false
          };
        } else if (enrichedDataCache[originalWord]) {
          console.log('[SpellCorrection] Using cached enrichment for:', originalWord);
          updatedEnrichedData[selectedWord] = {
            ...enrichedDataCache[originalWord],
            corrected_word: selectedWord,
            was_corrected: false
          };
        }
      }
      
      console.log('[SpellCorrection] Final words:', finalWords);
      console.log('[SpellCorrection] Updated enriched data keys:', Object.keys(updatedEnrichedData));
      
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

  return {
    pendingCorrections,
    setPendingCorrections,
    currentCorrectionIndex,
    setCurrentCorrectionIndex,
    correctionDecisions,
    setCorrectionDecisions,
    isProcessingCorrection,
    enrichedDataCache,
    setEnrichedDataCache,
    pendingWordsInput,
    setPendingWordsInput,
    handleWordSelect,
    handleSkipWord,
    finalizeCorrectedWords
  };
};