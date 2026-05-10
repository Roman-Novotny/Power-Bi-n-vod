import { useState } from 'react';
import { AlertTriangle, Search, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { errors, severityConfig } from '../data/errors';
import CodeBlock from '../components/CodeBlock';

const categories = ['Vše', ...new Set(errors.map(e => e.category))];

export default function ErrorsDatabase() {
  const [query, setQuery]     = useState('');
  const [category, setCategory] = useState('Vše');
  const [severity, setSeverity] = useState('Vše');
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = errors.filter(e => {
    const q = query.toLowerCase();
    const matchQ = !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.symptoms?.some(s => s.toLowerCase().includes(q));
    const matchC = category === 'Vše' || e.category === category;
    const matchS = severity === 'Vše' || e.severity === severity;
    return matchQ && matchC && matchS;
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <AlertTriangle size={22} className="text-yellow-400" />
          Chyby & Tipy
        </h1>
        <p className="text-gray-400 text-sm mt-1">Nejčastější chyby v Power BI – příčiny, příznaky a řešení</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hledat chyby…" className="input pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {['Vše','error','warning','info'].map(s => (
            <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${severity === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {s === 'Vše' ? 'Vše' : s === 'error' ? '🔴 Chyba' : s === 'warning' ? '🟡 Varování' : '🔵 Info'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} záznamů</p>

      {/* Error list */}
      <div className="space-y-3">
        {filtered.map(err => {
          const cfg   = severityConfig[err.severity] || severityConfig.info;
          const isOpen = expanded[err.id];

          return (
            <div key={err.id} className={`card border ${isOpen ? 'border-white/15' : ''}`}>
              {/* Header */}
              <button
                onClick={() => toggle(err.id)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <span className="text-xl">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-100 text-sm">{err.title}</h3>
                    <span className={`badge text-[10px] border ${cfg.color}`}>{cfg.label}</span>
                    <span className="badge bg-white/5 text-gray-500 text-[10px]">{err.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{err.description}</p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-5 animate-fade-in">
                  {/* Symptoms */}
                  {err.symptoms?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Příznaky</h4>
                      <ul className="space-y-1.5">
                        {err.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-red-400/70 mt-1 flex-shrink-0">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Causes */}
                  {err.causes?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Příčiny</h4>
                      <ul className="space-y-1.5">
                        {err.causes.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-yellow-400/70 mt-1 flex-shrink-0">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solutions */}
                  {err.solutions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Řešení</h4>
                      <div className="space-y-4">
                        {err.solutions.map((sol, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                              <h5 className="text-sm font-semibold text-gray-200">{sol.title}</h5>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-3">{sol.content}</p>
                            {sol.code && <CodeBlock code={sol.code} language="dax" onExport={false} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
