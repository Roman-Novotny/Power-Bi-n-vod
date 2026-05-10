import { useState } from 'react';
import { Wrench, Wand2, Lightbulb, BookOpen } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { generateMQuery, mOperations } from '../utils/generators';
import { useApp } from '../context/AppContext';

export default function PowerQueryGenerator() {
  const [form, setForm] = useState({ tableName: '', columnName: '', operation: '', value: '', newName: '', delimiter: ',', oldValue: '', newValue: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToHistory, addToast } = useApp();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const needsValue = ['filter-equals','filter-greater','filter-less','filter-contains'].includes(form.operation);
  const needsNewName = ['rename-column','add-column'].includes(form.operation);
  const needsDelimiter = form.operation === 'split-column';
  const needsReplace = form.operation === 'replace-value';

  const generate = (e) => {
    e.preventDefault();
    if (!form.tableName || !form.columnName || !form.operation) {
      addToast('Prosím vyplň tabulku, sloupec a operaci.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = generateMQuery(form.tableName, form.columnName, form.operation, form);
      if (!r) { addToast('Nepodporovaná operace.', 'error'); setLoading(false); return; }
      setResult(r);
      addToHistory({ type: 'MQuery', ...form, result: r });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Wrench size={22} className="text-emerald-400" />
          Generátor Power Query M kódu
        </h1>
        <p className="text-gray-400 text-sm mt-1">Vyber operaci – aplikace vygeneruje M kód s vysvětlením</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <form onSubmit={generate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název tabulky <span className="text-red-400">*</span></label>
                  <input value={form.tableName} onChange={e => set('tableName', e.target.value)} placeholder="Objednávky" className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název sloupce <span className="text-red-400">*</span></label>
                  <input value={form.columnName} onChange={e => set('columnName', e.target.value)} placeholder="DatumObjednávky" className="input" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Operace <span className="text-red-400">*</span></label>
                <select value={form.operation} onChange={e => { set('operation', e.target.value); setResult(null); }} className="select" required>
                  <option value="">-- Vyberte operaci --</option>
                  {mOperations.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Conditional extra inputs */}
              {needsValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Hodnota filtru</label>
                  <input value={form.value} onChange={e => set('value', e.target.value)} placeholder="Zadej hodnotu…" className="input" />
                </div>
              )}
              {needsNewName && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{form.operation === 'rename-column' ? 'Nový název sloupce' : 'Název nového sloupce'}</label>
                  <input value={form.newName} onChange={e => set('newName', e.target.value)} placeholder="NovýNázev" className="input" />
                </div>
              )}
              {needsDelimiter && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Oddělovač</label>
                  <input value={form.delimiter} onChange={e => set('delimiter', e.target.value)} placeholder="," className="input" />
                </div>
              )}
              {needsReplace && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Stará hodnota</label>
                    <input value={form.oldValue} onChange={e => set('oldValue', e.target.value)} placeholder="Stará hodnota" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Nová hodnota</label>
                    <input value={form.newValue} onChange={e => set('newValue', e.target.value)} placeholder="Nová hodnota" className="input" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-700">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={17} />}
                {loading ? 'Generuji…' : 'Generovat M kód'}
              </button>
            </form>
          </div>

          {result && (
            <div className="card p-6 space-y-5 animate-slide-up border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Wrench size={16} />
                Vygenerovaný M kód
              </div>

              <CodeBlock code={result.code} language="mquery" title="Power Query M" />

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Vysvětlení</p>
                  <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                    __html: result.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
                  }} />
                </div>
                {result.notes && (
                  <div className="flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                    <Lightbulb size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/80">{result.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-gray-500" /> Dostupné operace
            </h3>
            <div className="space-y-3">
              {mOperations.map(group => (
                <div key={group.group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1.5 font-semibold">{group.group}</p>
                  <div className="space-y-1">
                    {group.items.map(op => (
                      <button
                        key={op.value}
                        onClick={() => { set('operation', op.value); setResult(null); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          form.operation === op.value
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Lightbulb size={15} className="text-yellow-400" /> Tip
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              M kód se vkládá do editoru Power Query v Power BI Desktop. Otevři ho přes <strong className="text-gray-300">Domů → Transformovat data</strong>, a pak klikni na konkrétní krok nebo vlož nový.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
