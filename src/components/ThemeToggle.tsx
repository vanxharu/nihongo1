import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
  return <button type="button" className="brand-theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
  </button>;
}
