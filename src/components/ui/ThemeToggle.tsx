import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-all hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Icon name="Moon" size={20} className="transition-transform" />
      ) : (
        <Icon name="Sun" size={20} className="transition-transform" />
      )}
    </Button>
  );
};

export default ThemeToggle;
