import { useState } from 'react';
import { Sparkles, Lightbulb, BookOpen, Wand2, ChevronDown } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { generateDAX } from '../utils/generators';
import { useApp } from '../context/AppContext';

const examples = [
  { desc: 'Chci spočítat celkové tržby',       table: 'Objednávky',  col: 'Tržba',       alias: 'CelkovéTržby' },
  { desc: 'Potřebuji průměrnou hodnotu objednávky', table: 'Objednávky', col: 'Hodnota',  alias: 'PrůměrnáObjednávka' },
  { desc: 'Kolik unikátních zákazníků máme',   table: 'Zákazníci',   col: 'ZákazníkID',  alias: 'PočetZákazníků' },
  { desc: 'YTD výpočet tržeb od začátku roku', table: 'Objednávky',  col: 'Tržba',       alias: 'TržbyYTD' },
  { desc: 'Procento tržeb z celku',             table: 'Objednávky',  col: 'Tržba',       alias: 'TržbyProcento' },
  { desc: 'Součet tržeb za minulý rok',         table: 'Objednávky',  col: 'Tržba',       alias: 'TržbyMinulýRok' },
];

export default function DaxGenerator() {
  const [form, setForm] = useState({ description: '', tableName: '', columnName: '', measureName: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToHistory, addToast } = useApp();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = (e) => {
    e.preventDefault();
    if (!form.description || !form.tableName || !form.columnName) {
      addToast('Prosím vyplň popis, tabulku i sloupec.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = generateDAX(form.description, form.tableName, form.columnName, form.measureName);
      setResult(r);
      addToHistory({ type: 'DAX', ...form, result: r });
      setLoading(false);
    }, 400);
  };

  const loadExample = (ex) => {
    setForm({ description: ex.desc, tableName: ex.table, columnName: ex.col, measureName: ex.alias });
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Sparkles size={22} className="text-purple-400" />
          Generátor DAX výrazů
        </h1>
        <p className="text-gray-400 text-sm mt-1">Popiš, co chceš vypočítat – aplikace vygeneruje DAX s vysvětlením</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 space-y-5">
            <form onSubmit={generate} className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Co chceš vypočítat? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Např. Chci spočítat celkové tržby za minulý rok…"
                  className="textarea h-24"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Piš česky nebo anglicky. Napiš klíčová slova: součet, průměr, procento, YTD, minulý rok…</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Název tabulky <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.tableName}
                    onChange={e => set('tableName', e.target.value)}
                    placeholder="Objednávky"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Název sloupce <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.columnName}
                    onChange={e => set('columnName', e.target.value)}
                    placeholder="Tržba"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Název míry <span className="text-gray-500 font-normal">(volitelné)</span>
                </label>
                <input
                  value={form.measureName}
                  onChange={e => set('measureName', e.target.value)}
                  placeholder="CelkovéTržby"
                  className="input"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wand2 size={17} />
                )}
                {loading ? 'Generuji…' : 'Generovat DAX výraz'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className="card p-6 space-y-5 animate-slide-up border-brand-500/20">
              <div className="flex items-center gap-2 text-brand-400 font-semibold">
                <Sparkles size={16} />
                Vygenerovaný výraz
              </div>

              <CodeBlock code={result.code} language="dax" title="DAX" />

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Kategorie</p>
                  <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">{result.category}</span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Vysvětlení</p>
                  <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                    __html: result.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
                  }} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Syntaxe</p>
                  <code className="text-xs text-purple-300 bg-purple-500/10 px-3 py-2 rounded-lg block border border-purple-500/20 whitespace-pre-wrap font-mono">
                    {result.syntax}
                  </code>
                </div>

                {result.tips?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Tipy</p>
                    <div className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <Lightbulb size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-300/80">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar – examples */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-gray-500" /> Příklady
            </h3>
            <div className="space-y-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="w-full text-left p-3 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/15 transition-all group"
                >
                  <p className="text-xs text-gray-300 group-hover:text-white leading-snug">{ex.desc}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{ex.table}[{ex.col}]</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Lightbulb size={15} className="text-yellow-400" /> Klíčová slova
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              {[
                ['součet, suma, celkem', 'SUM()'],
                ['průměr', 'AVERAGE()'],
                ['počet, kolik', 'COUNTROWS()'],
                ['unikátní, distinct', 'DISTINCTCOUNT()'],
                ['ytd, od začátku roku', 'DATESYTD()'],
                ['minulý rok, loni', 'SAMEPERIODLASTYEAR()'],
                ['procento, podíl', 'DIVIDE() + ALL()'],
                ['pořadí, rank', 'RANKX()'],
                ['podmínka, pokud', 'IF() / SWITCH()'],
              ].map(([kw, fn]) => (
                <div key={kw} className="flex justify-between">
                  <span className="text-gray-500 italic">{kw}</span>
                  <code className="text-brand-400 font-mono text-[11px]">{fn}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
