import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { type Category } from '@/data/categories';
import { type Word } from './WordCard';

const PAYMENT_URL = 'https://functions.poehali.dev/2dff5495-d644-4ffa-ac37-8f34273b0ef7';

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
  const [sortLimit, setSortLimit] = useState<{used: number; limit: number} | null>(null);

  useEffect(() => {
    const fetchSortLimit = async () => {
      const userDataStr = localStorage.getItem('shagtospeak_user');
      if (!userDataStr) return;
      
      const userData = JSON.parse(userDataStr);
      const userId = userData.id?.toString();
      
      try {
        const response = await fetch(`${PAYMENT_URL}?action=status`, {
          headers: { 'X-User-Id': userId }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSortLimit({
            used: data.limits.status_changes.used,
            limit: data.limits.status_changes.limit
          });
        }
      } catch (err) {
        console.error('Failed to fetch sort limit:', err);
      }
    };
    
    fetchSortLimit();
  }, []);

  return (
    <>
      {sortLimit && (
        <div className="mb-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Icon name="ArrowUpDown" size={14} className="text-blue-500" />
          <span>
            Сортировок: <span className="font-semibold text-foreground">{sortLimit.used} / {sortLimit.limit === -1 ? '∞' : sortLimit.limit}</span>
          </span>
        </div>
      )}
      
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
      
      {categoriesWithWords.length === 0 && !isLoading && uncategorizedCount === 0 && (
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