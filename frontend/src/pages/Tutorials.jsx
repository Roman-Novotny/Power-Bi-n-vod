import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Clock, Star, ArrowRight, Filter } from 'lucide-react';
import { tutorials, categories, difficultyColors } from '../data/tutorials';
import { useApp } from '../context/AppContext';

const difficulties = ['Všechny', 'Začátečník', 'Střední', 'Pokročilý'];

export default function Tutorials() {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('Všechny');
  const [searchParams] = useSearchParams();
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || '');
  const { favorites, toggleFavorite, addToast } = useApp();

  const filtered = useMemo(() => {
    return tutorials.filter(t => {
      const matchQ = !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      const matchD = difficulty === 'Všechny' || t.difficulty === difficulty;
      const cat = categories.find(c => c.name === t.category);
      const matchC = !activeCat || (cat && cat.id === activeCat);
      return matchQ && matchD && matchC;
    });
  }, [query, difficulty, activeCat]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <BookOpen size={22} className="text-brand-400" />
          Návody
        </h1>
        <p className="text-gray-400 text-sm mt-1">Detailní průvodci pro práci s Power BI</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Hledat návody…"
              className="input pl-9 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  difficulty === d
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat('')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              !activeCat
                ? 'border-brand-500/50 bg-brand-500/15 text-brand-400'
                : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            Vše
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(prev => prev === c.id ? '' : c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeCat === c.id
                  ? 'border-brand-500/50 bg-brand-500/15 text-brand-400'
                  : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length === tutorials.length
          ? `${tutorials.length} návodů`
          : `${filtered.length} z ${tutorials.length} návodů`}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={32} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Žádné návody neodpovídají vašemu hledání.</p>
          <button onClick={() => { setQuery(''); setDifficulty('Všechny'); setActiveCat(''); }} className="mt-3 text-sm text-brand-400 hover:text-brand-300">
            Resetovat filtry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="card p-5 group flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap mb-2">
                  <Link
                    to={`/tutorials/${t.id}`}
                    className="text-base font-semibold text-gray-100 group-hover:text-white transition-colors hover:text-brand-300"
                  >
                    {t.title}
                  </Link>
                  <span className={`badge ${difficultyColors[t.difficulty] || ''} text-[11px]`}>
                    {t.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">{t.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={11} />{t.duration}</span>
                  <span className="text-gray-600">·</span>
                  <span>{t.category}</span>
                  <span className="text-gray-600">·</span>
                  <span>{t.steps.length} kroků</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(t.id);
                    addToast(favorites.includes(t.id) ? 'Odstraněno z oblíbených' : 'Přidáno do oblíbených', 'success');
                  }}
                  className="btn-ghost p-2"
                  aria-label="Oblíbené"
                >
                  <Star
                    size={16}
                    className={favorites.includes(t.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                  />
                </button>
                <Link to={`/tutorials/${t.id}`} className="btn-ghost p-2 mt-auto">
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
