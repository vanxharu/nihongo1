import { useTheme } from '../contexts/ThemeContext';
import DaySkySwitch from './ui/DaySkySwitch';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
  return <DaySkySwitch night={theme === 'dark'} onToggle={toggleTheme} label={label} />;
}
