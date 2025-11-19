import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { type Category } from '@/data/categories';
import { type Word } from './WordCard';

interface WordsCategoriesViewProps {
  categoriesWithWords: Category[];
  wordsByCategory: Record<string, Word[]>;
  isLoading: boolean;
  onCategoryClick: (categoryId: string) => void;
}

const WordsCategoriesView = ({
  categoriesWithWords,
  wordsByCategory,
  isLoading,
  onCategoryClick
}: WordsCategoriesViewProps) => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
