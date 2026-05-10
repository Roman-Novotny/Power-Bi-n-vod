import { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // History of generated expressions
  const [history, setHistory] = useLocalStorage('pbi_history', []);
  // Favourite tutorial IDs
  const [favorites, setFavorites] = useLocalStorage('pbi_favorites', []);
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  // Search query (global)
  const [searchQuery, setSearchQuery] = useState('');

  // ── History ─────────────────────────────────────────────────────────────
  const addToHistory = useCallback((item) => {
    const entry = { ...item, id: Date.now(), createdAt: new Date().toISOString() };
    setHistory(prev => [entry, ...prev].slice(0, 100));
  }, [setHistory]);

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  // ── Favorites ────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Clipboard ────────────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('Zkopírováno do schránky!', 'success');
    } catch {
      addToast('Kopírování se nezdařilo.', 'error');
    }
  }, [addToast]);

  const value = {
    history, addToHistory, removeFromHistory, clearHistory,
    favorites, toggleFavorite, isFavorite,
    toasts, addToast, removeToast,
    copyToClipboard,
    searchQuery, setSearchQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
