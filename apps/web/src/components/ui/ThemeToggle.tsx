import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "p-2 rounded-xl transition-all active:scale-95",
        "border border-[var(--border)]",
        "bg-[var(--glass)] backdrop-blur-md",
        "text-[var(--text-muted)] hover:text-[var(--text)]",
        "shadow-[0_0_40px_var(--glow)]",
      ].join(" ")}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
