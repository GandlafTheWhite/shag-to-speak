import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import WordsListView from './words/WordsListView';
import WordsCategoriesView from './words/WordsCategoriesView';
import CorrectionSuggestionsDialog from './words/CorrectionSuggestionsDialog';
import { useMyWordsData } from './MyWords/useMyWordsData';
import { useSpellCorrection } from './MyWords/useSpellCorrection';
import { useWordActions } from './MyWords/useWordActions';

interface MyWordsProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'words' | 'learn' | 'progress' | 'help') => void;
  updateUser: (data: Partial<User>) => void;
}

const MyWords = ({ user, onNavigate, updateUser }: MyWordsProps) => {
  const dataState = useMyWordsData(user, updateUser);
  
  const spellCorrection = useSpellCorrection(
    user,
    dataState.words,
    dataState.setWords,
    updateUser,
    dataState.setNewWord,
    dataState.setIsAddDialogOpen,
    dataState.setIsLoading,
    dataState.toast
  );
  
  const wordActions = useWordActions(
    user,
    dataState.words,
    dataState.setWords,
    updateUser,
    dataState.newWord,
    dataState.setNewWord,
    dataState.setIsAddDialogOpen,
    dataState.aiPrompt,
    dataState.setAiPrompt,
    dataState.setIsAiDialogOpen,
    dataState.setSelectedWord,
    dataState.setIsLoading,
    dataState.setIsCategorizing,
    dataState.loadWords,
    dataState.viewMode,
    dataState.setViewMode,
    dataState.setSelectedCategory,
    dataState.toast,
    spellCorrection.setPendingCorrections,
    spellCorrection.setCurrentCorrectionIndex,
    spellCorrection.setCorrectionDecisions,
    spellCorrection.setEnrichedDataCache,
    spellCorrection.setPendingWordsInput
  );

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
        <Tabs value={dataState.viewMode} onValueChange={(v: any) => dataState.setViewMode(v)} className="mb-6">
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
              words={dataState.words}
              filteredWords={dataState.filteredWords}
              filterStatus={dataState.filterStatus}
              setFilterStatus={dataState.setFilterStatus}
              isLoading={dataState.isLoading}
              newWord={dataState.newWord}
              setNewWord={dataState.setNewWord}
              aiPrompt={dataState.aiPrompt}
              setAiPrompt={dataState.setAiPrompt}
              isAddDialogOpen={dataState.isAddDialogOpen}
              setIsAddDialogOpen={dataState.setIsAddDialogOpen}
              isAiDialogOpen={dataState.isAiDialogOpen}
              setIsAiDialogOpen={dataState.setIsAiDialogOpen}
              isSetsDialogOpen={dataState.isSetsDialogOpen}
              setIsSetsDialogOpen={dataState.setIsSetsDialogOpen}
              onAddWord={wordActions.handleAddWord}
              onAiGenerate={wordActions.handleAiGenerate}
              onAddWordSet={wordActions.handleAddWordSet}
              onStatusChange={wordActions.handleStatusChange}
              onDelete={wordActions.handleDelete}
              onSelectWord={dataState.setSelectedWord}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <WordsCategoriesView
              categoriesWithWords={dataState.categoriesWithWords}
              wordsByCategory={dataState.wordsByCategory}
              isLoading={dataState.isLoading}
              isCategorizing={dataState.isCategorizing}
              onCategoryClick={wordActions.handleCategoryClick}
              onCategorizeWords={wordActions.handleCategorizeWords}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CorrectionSuggestionsDialog
        corrections={spellCorrection.pendingCorrections}
        currentIndex={spellCorrection.currentCorrectionIndex}
        onWordSelect={spellCorrection.handleWordSelect}
        onSkipWord={spellCorrection.handleSkipWord}
        isOpen={spellCorrection.pendingCorrections.length > 0 && spellCorrection.currentCorrectionIndex < spellCorrection.pendingCorrections.length}
        isProcessing={spellCorrection.isProcessingCorrection}
      />
    </div>
  );
};

export default MyWords;
