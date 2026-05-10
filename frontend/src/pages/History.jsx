import { useState } from 'react';
import { Clock, Trash2, Sparkles, Wrench, Search, Download } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { useApp } from '../context/AppContext';

export default function History() {
  const { history, removeFromHistory, clearHistory, addToast } = useApp();
  const [filter, setFilter] = useState('Vše');
  const [query, setQuery]   = useState('');
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = history.filter(h => {
    const matchF = filter === 'Vše' || h.type === filter;
    const q = query.toLowerCase();
    const matchQ = !q ||
      h.description?.toLowerCase().includes(q) ||
      h.tableName?.toLowerCase().includes(q) ||
      h.columnName?.toLowerCase().includes(q);
    return matchF && matchQ;
  });

  const exportAll = () => {
    const lines = history.map(h =>
      `=== ${h.type} – ${new Date(h.createdAt).toLocaleString('cs-CZ')} ===\n${h.result?.code || ''}\n`
    ).join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'pbi-historie.txt'; a.click();
    URL.revokeObjectURL(url);
    addToast('Historie exportována!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Clock size={22} className="text-brand-400" />
            Historie generování
          </h1>
          <p className="text-gray-400 text-sm mt-1">{history.length} uložených výrazů</p>
        </div>
        {history.length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={exportAll} className="btn-secondary text-sm gap-1.5">
              <Download size={14} /> Export
            </button>
            <button onClick={() => { clearHistory(); addToast('Historie smazána.', 'info'); }} className="btn-secondary text-sm gap-1.5 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/30">
              <Trash2 size={14} /> Smazat vše
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Zatím žádná historie</p>
          <p className="text-gray-600 text-sm mt-2">Generuj DAX nebo M kód a výsledky se automaticky uloží sem.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hledat v historii…" className="input pl-9 py-2 text-sm" />
            </div>
            {['Vše','DAX','MQuery'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {f === 'MQuery' ? 'Power Query M' : f}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500">{filtered.length} záznamů</p>

          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="card p-4 group">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${item.type === 'DAX' ? 'bg-purple-500/15' : 'bg-emerald-500/15'}`}>
                    {item.type === 'DAX'
                      ? <Sparkles size={16} className="text-purple-400" />
                      : <Wrench   size={16} className="text-emerald-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge text-[10px] ${item.type === 'DAX' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.type === 'MQuery' ? 'Power Query M' : item.type}
                      </span>
                      <span className="text-xs text-gray-600">{new Date(item.createdAt).toLocaleString('cs-CZ')}</span>
                    </div>
                    {item.description && <p className="text-sm text-gray-300 mb-1">{item.description}</p>}
                    <p className="text-xs text-gray-500">{item.tableName}[{item.columnName}]</p>

                    {item.result?.code && (
                      <button
                        onClick={() => toggle(item.id)}
                        className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        {expanded[item.id] ? 'Skrýt kód' : 'Zobrazit kód'}
                      </button>
                    )}

                    {expanded[item.id] && item.result?.code && (
                      <div className="mt-3 animate-fade-in">
                        <CodeBlock code={item.result.code} language={item.type === 'DAX' ? 'dax' : 'mquery'} title={item.type} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { removeFromHistory(item.id); addToast('Záznam odstraněn.', 'info'); }}
                    className="btn-ghost p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
