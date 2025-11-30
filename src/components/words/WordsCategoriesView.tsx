import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { type Category } from '@/data/categories';
import { type Word } from './WordCard';

interface WordsCategoriesViewProps {
  categoriesWithWords: Category[];
  wordsByCategory: Record<string, Word[]>;
  isLoading: boolean;
  isCategorizing: boolean;
  onCategoryClick: (categoryId: string) => void;
  onCategorizeWords: () => void;
}

const WordsCategoriesView = ({
  categoriesWithWords,
  wordsByCategory,
  isLoading,
  isCategorizing,
  onCategoryClick,
  onCategorizeWords
}: WordsCategoriesViewProps) => {
  const uncategorizedCount = wordsByCategory['uncategorized']?.length || 0;
  return (
    <>
      {uncategorizedCount > 0 && (
        <div className="mb-6 p-3 sm:p-4 bg-accent/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <Icon name="Sparkles" size={24} className="text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base break-words">Слов без категории: {uncategorizedCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground break-words">ИИ может автоматически распределить их по категориям</p>
            </div>
          </div>
          <Button
            onClick={onCategorizeWords}
            disabled={isCategorizing}
            size="default"
            className="w-full sm:w-auto flex-shrink-0"
          >
            {isCategorizing ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                <span className="hidden sm:inline">Рассортировка...</span>
                <span className="sm:hidden">ИИ...</span>
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={18} className="mr-2" />
                <span className="hidden sm:inline">Рассортировать через ИИ</span>
                <span className="sm:hidden">Рассортировать</span>
              </>
            )}
          </Button>
        </div>
      )}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        {categoriesWithWords.map(category => (
          <Card 
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => onCategoryClick(category.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-3xl">{category.icon}</div>
                <Badge variant="secondary">
                  {wordsByCategory[category.id].length}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{category.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {categoriesWithWords.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Icon name="Folder" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-2">Нет категорий</p>
          <p className="text-sm text-muted-foreground">Добавьте слова, чтобы они автоматически распределились по категориям</p>
        </div>
      )}
    </>
  );
};

export default WordsCategoriesView;