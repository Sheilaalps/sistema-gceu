import { createContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const salvo = localStorage.getItem('tema');
    if (salvo !== null) return salvo === 'dark';
    return true; // Padrão: escuro
  });

  // Aplicar tema ao montar e quando mudar
  useEffect(() => {
    const tema = isDark ? 'dark' : 'light';
    localStorage.setItem('tema', tema);
    document.documentElement.setAttribute('data-theme', tema);
    document.documentElement.style.colorScheme = tema;
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
