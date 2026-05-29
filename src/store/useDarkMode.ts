import { useState, useEffect } from 'react';

function getInitial(): boolean {
  const stored = localStorage.getItem('ft_dark');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ft_dark', String(dark));
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
