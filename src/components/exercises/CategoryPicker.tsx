import { useEffect, useState } from 'react';
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
  everyday: 'House',
  work: 'Building2',
  essential_1000: 'GraduationCap',
  default: 'BookMarked',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; hover: string }> = {
  travel: { bg: 'bg-blue-500/10', text: 'text-blue-500', hover: 'hover:bg-blue-500/20' },
  business: { bg: 'bg-purple-500/10', text: 'text-purple-500', hover: 'hover:bg-purple-500/20' },
  food: { bg: 'bg-orange-500/10', text: 'text-orange-500', hover: 'hover:bg-orange-500/20' },
  technology: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', hover: 'hover:bg-cyan-500/20' },
  health: { bg: 'bg-red-500/10', text: 'text-red-500', hover: 'hover:bg-red-500/20' },
  education: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', hover: 'hover:bg-indigo-500/20' },
  sports: { bg: 'bg-green-500/10', text: 'text-green-500', hover: 'hover:bg-green-500/20' },
  entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-500', hover: 'hover:bg-pink-500/20' },
  everyday: { bg: 'bg-teal-500/10', text: 'text-teal-500', hover: 'hover:bg-teal-500/20' },
  work: { bg: 'bg-slate-500/10', text: 'text-slate-500', hover: 'hover:bg-slate-500/20' },
  essential_1000: { bg: 'bg-amber-500/10', text: 'text-amber-500', hover: 'hover:bg-amber-500/20' },
  default: { bg: 'bg-primary/10', text: 'text-primary', hover: 'hover:bg-primary/20' },
};

const CategoryPicker = ({ categories, onSelect, isLoading }: CategoryPickerProps) => {
  const [displayCategories, setDisplayCategories] = useState<ExerciseCategory[]>([]);

  useEffect(() => {
    if (categories.length > 0) {
      setDisplayCategories(categories);
    }
  }, [categories]);

  const getCategoryIcon = (categoryName: string): string => {
    const baseCategory = categoryName.split('_')[0];
    return CATEGORY_ICONS[baseCategory] || CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
  };

  const getCategoryColor = (categoryName: string) => {
    const baseCategory = categoryName.split('_')[0];
    return CATEGORY_COLORS[baseCategory] || CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.default;
  };

  const formatCategoryName = (name: string): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
          const colors = getCategoryColor(category.name);
          return (
            <button
              key={category.name}
              onClick={() => onSelect(category.name)}
              className={`group flex items-center gap-4 p-4 rounded-xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left`}
            >
              <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${colors.bg} ${colors.hover} flex items-center justify-center transition-all group-hover:scale-110`}>
                <Icon 
                  name={getCategoryIcon(category.name)} 
                  size={28} 
                  className={`${colors.text} sm:w-8 sm:h-8`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-0.5 truncate">
                  {formatCategoryName(category.name)}
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