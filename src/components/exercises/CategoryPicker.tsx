import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ExerciseCategory } from '@/utils/api';

interface CategoryPickerProps {
  categories: ExerciseCategory[];
  onSelect: (category: string) => void;
  isLoading?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  travel: 'Plane',
  business: 'Briefcase',
  food: 'Utensils',
  technology: 'Laptop',
  health: 'Heart',
  education: 'GraduationCap',
  sports: 'Trophy',
  entertainment: 'Tv',
  nature: 'Trees',
  family: 'Users',
  emotions: 'Smile',
  time: 'Clock',
  colors: 'Palette',
  numbers_quantities: 'Hash',
  animals: 'Dog',
  clothes_accessories: 'Shirt',
  transport_travel: 'Car',
  home_furniture: 'Home',
  art_literature: 'BookOpen',
  science_math: 'Microscope',
  business_money: 'DollarSign',
  medicine_health: 'Stethoscope',
  languages: 'Languages',
  default: 'BookMarked',
};

const CategoryPicker = ({ categories, onSelect, isLoading }: CategoryPickerProps) => {
  const [displayCategories, setDisplayCategories] = useState<ExerciseCategory[]>([]);

  useEffect(() => {
    if (categories.length > 0) {
      setDisplayCategories(categories);
    }
  }, [categories]);

  const getIconForCategory = (categoryName: string): string => {
    return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
  };

  const formatCategoryName = (name: string): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-muted animate-pulse rounded-lg"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Выбери категорию</h3>
        <p className="text-sm text-muted-foreground">
          {displayCategories.length} {displayCategories.length === 1 ? 'категория' : 'категории'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayCategories.map((category) => (
          <Button
            key={category.name}
            onClick={() => onSelect(category.name)}
            variant="outline"
            className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Icon 
                name={getIconForCategory(category.name)} 
                size={32} 
                className="text-primary"
              />
            </div>
            
            <div className="text-center">
              <p className="font-semibold text-base mb-1">
                {formatCategoryName(category.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                {category.word_count} {category.word_count === 1 ? 'слово' : 'слов'}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPicker;
