import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({ onMenuClick }) {
  const { setSearchQuery } = useApp();
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSearchQuery(input.trim());
    navigate('/tutorials');
  };

  const clear = () => {
    setInput('');
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-10 h-14 bg-bg-primary/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-3">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-2"
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Hledat návody, DAX funkce, chyby…"
          className="input pl-9 pr-8 py-2 text-sm h-9"
        />
        {input && (
          <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </form>
    </header>
  );
}
