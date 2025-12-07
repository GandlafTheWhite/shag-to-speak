import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Suggestion {
  word: string;
  translation: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Correction {
  original: string;
  suggestions: Suggestion[];
}

interface CorrectionSuggestionsDialogProps {
  corrections: Correction[];
  currentIndex: number;
  onWordSelect: (selectedWord: string, originalWord: string) => void;
  onSkipWord: () => void;
  isOpen: boolean;
  isProcessing: boolean;
}

const CorrectionSuggestionsDialog = ({ 
  corrections, 
  currentIndex, 
  onWordSelect, 
  onSkipWord,
  isOpen,
  isProcessing
}: CorrectionSuggestionsDialogProps) => {
  const [selectedWordState, setSelectedWordState] = useState<string | null>(null);

  if (currentIndex >= corrections.length) return null;

  const current = corrections[currentIndex];
  const progress = `${currentIndex + 1}/${corrections.length}`;

  const handleWordClick = (word: string) => {
    setSelectedWordState(word);
    setTimeout(() => {
      onWordSelect(word, current.original);
      setSelectedWordState(null);
    }, 150);
  };

  const handleSkip = () => {
    onSkipWord();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'высокая';
      case 'medium': return 'средняя';
      case 'low': return 'низкая';
      default: return confidence;
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="AlertCircle" size={24} className="text-orange-500" />
            Ой, такого слова в английском не существует!
          </DialogTitle>
          <DialogDescription>
            <span className="text-sm">
              Вероятно это опечатка в слове <span className="font-mono font-semibold text-red-500">{current.original}</span>
            </span>
            {corrections.length > 1 && (
              <span className="block text-xs text-muted-foreground mt-1">
                {progress}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-3">Какое слово вы имели в виду?</p>
          
          <div className="space-y-2">
            {current.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(suggestion.word)}
                disabled={isProcessing}
                className={`w-full p-4 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedWordState === suggestion.word ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-lg">{suggestion.word}</span>
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                        {getConfidenceLabel(suggestion.confidence)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{suggestion.translation}</span>
                  </div>
                  {selectedWordState === suggestion.word && isProcessing && (
                    <Icon name="Loader2" size={20} className="animate-spin text-primary" />
                  )}
                  {selectedWordState !== suggestion.word && !isProcessing && (
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            disabled={isProcessing}
            className="w-full"
          >
            <Icon name="X" size={16} className="mr-2" />
            Ничего из перечисленного
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionSuggestionsDialog;