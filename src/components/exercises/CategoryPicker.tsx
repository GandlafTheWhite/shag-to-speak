import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { ExerciseCategory } from '@/utils/api';
import { getCategoryById, getCategoryIcon, getCategoryTitle } from '@/data/categories';

interface CategoryPickerProps {
  categories: ExerciseCategory[];
  onSelect: (category: string) => void;
  isLoading?: boolean;
}

const CategoryPicker = ({ categories, onSelect, isLoading }: CategoryPickerProps) => {
  const [displayCategories, setDisplayCategories] = useState<ExerciseCategory[]>([]);

  useEffect(() => {
    if (categories.length > 0) {
      setDisplayCategories(categories);
    }
  }, [categories]);



  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-28 bg-muted/50 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (displayCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Icon name="BookOpen" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Нет категорий</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Добавь слова в словарь, чтобы начать упражнения
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">Выбери категорию слов</h2>
        <p className="text-sm text-muted-foreground">
          {displayCategories.length} {displayCategories.length === 1 ? 'категория' : displayCategories.length < 5 ? 'категории' : 'категорий'} доступно
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {displayCategories.map((category) => {
          const categoryData = getCategoryById(category.name);
          const icon = categoryData ? categoryData.icon : getCategoryIcon(category.name);
          const title = categoryData ? categoryData.title : getCategoryTitle(category.name);
          
          return (
            <button
              key={category.name}
              onClick={() => onSelect(category.name)}
              className="group flex items-center gap-4 p-4 rounded-xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left"
            >
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all group-hover:scale-110">
                <span className="text-3xl sm:text-4xl">{icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-0.5 truncate">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {category.word_count} {category.word_count === 1 ? 'слово' : category.word_count < 5 ? 'слова' : 'слов'}
                </p>
              </div>
              
              <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPicker;