import { useState } from 'react';
import { Map, ChevronRight, ArrowLeft, Check, Wand2, Lightbulb } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { generateDAX, generateMQuery } from '../utils/generators';
import { useApp } from '../context/AppContext';

// ── Wizard definition ────────────────────────────────────────────────────────
const steps = [
  {
    id: 'goal',
    question: 'Co chceš v Power BI udělat?',
    type: 'choice',
    choices: [
      { value: 'calculate',    label: 'Vypočítat hodnotu (DAX)',      icon: '✨', next: 'calc_type' },
      { value: 'transform',   label: 'Transformovat data (M Query)',  icon: '🔧', next: 'mq_op' },
      { value: 'filter',      label: 'Filtrovat data',                icon: '🔍', next: 'filter_type' },
      { value: 'time',        label: 'Časová analýza (YTD, MoM…)',   icon: '⏱️', next: 'time_type' },
      { value: 'relationship',label: 'Propojit tabulky',             icon: '🔗', next: 'result_info' },
    ],
  },
  {
    id: 'calc_type',
    question: 'Jaký typ výpočtu chceš?',
    type: 'choice',
    choices: [
      { value: 'součet',      label: 'Součet (SUM)',         icon: '➕', next: 'inputs_dax' },
      { value: 'průměr',      label: 'Průměr (AVERAGE)',     icon: '📊', next: 'inputs_dax' },
      { value: 'počet',       label: 'Počet (COUNT)',        icon: '🔢', next: 'inputs_dax' },
      { value: 'unikátní',    label: 'Unikátní hodnoty',     icon: '🎯', next: 'inputs_dax' },
      { value: 'procento',    label: 'Procento z celku',     icon: '💯', next: 'inputs_dax' },
      { value: 'podmínka',    label: 'Podmíněný výpočet',    icon: '❓', next: 'inputs_dax' },
    ],
  },
  {
    id: 'time_type',
    question: 'Jakou časovou metriku chceš?',
    type: 'choice',
    choices: [
      { value: 'ytd',            label: 'YTD – od začátku roku',    icon: '📅', next: 'inputs_dax' },
      { value: 'mtd',            label: 'MTD – od začátku měsíce',  icon: '📆', next: 'inputs_dax' },
      { value: 'předchozí rok',  label: 'Minulý rok (PYTD)',         icon: '⏪', next: 'inputs_dax' },
      { value: 'průběžný součet',label: 'Průběžný kumulativní součet',icon: '📈', next: 'inputs_dax' },
    ],
  },
  {
    id: 'filter_type',
    question: 'Jak chceš filtrovat?',
    type: 'choice',
    choices: [
      { value: 'calculate', label: 'Filtrovaný výpočet (CALCULATE)', icon: '🎛️', next: 'inputs_dax' },
      { value: 'filter-equals', label: 'Filtr rovná se (M Query)',  icon: '=', next: 'inputs_mq' },
      { value: 'filter-contains', label: 'Filtr obsahuje text',    icon: '🔤', next: 'inputs_mq' },
      { value: 'filter-not-null', label: 'Odstraň prázdné hodnoty',icon: '🚫', next: 'inputs_mq' },
    ],
  },
  {
    id: 'mq_op',
    question: 'Jakou transformaci chceš provést?',
    type: 'choice',
    choices: [
      { value: 'change-type-number', label: 'Změna datového typu na číslo', icon: '🔢', next: 'inputs_mq' },
      { value: 'change-type-date',   label: 'Změna datového typu na datum',  icon: '📅', next: 'inputs_mq' },
      { value: 'remove-column',      label: 'Odstraň sloupec',               icon: '🗑️', next: 'inputs_mq' },
      { value: 'remove-duplicates',  label: 'Odstraň duplicity',             icon: '♻️', next: 'inputs_mq' },
      { value: 'group-by',           label: 'Seskup a agreguj',              icon: '📋', next: 'inputs_mq' },
      { value: 'fill-down',          label: 'Vyplň dolů (Fill Down)',        icon: '⬇️', next: 'inputs_mq' },
    ],
  },
  {
    id: 'inputs_dax',
    question: 'Zadej informace o tvé tabulce',
    type: 'inputs_dax',
    next: 'result_dax',
  },
  {
    id: 'inputs_mq',
    question: 'Zadej informace o tvé tabulce',
    type: 'inputs_mq',
    next: 'result_mq',
  },
  {
    id: 'result_info',
    question: 'Jak propojit tabulky',
    type: 'info',
    content: {
      text: `Pro propojení tabulek v Power BI:
1. Přejdi do zobrazení **Model** (vlevo).
2. Přetáhni klíčový sloupec z jedné tabulky na druhý.
3. Power BI vytvoří relaci automaticky.
4. Dvakrát klikni na čáru pro nastavení kardinality (1:N, 1:1) a směru filtru.`,
      tip: 'Nejčastější relace je 1:N – jeden zákazník, mnoho objednávek.',
      link: '/tutorials/propojeni-tabulek',
    },
  },
];

const getStep = (id) => steps.find(s => s.id === id);

// ── Component ─────────────────────────────────────────────────────────────────
export default function InteractiveGuide() {
  const { addToHistory } = useApp();
  const [history, setHistory] = useState(['goal']);
  const [selections, setSelections] = useState({});
  const [inputs, setInputs]   = useState({ tableName: '', columnName: '', measureName: '' });
  const [result, setResult]   = useState(null);

  const currentId  = history[history.length - 1];
  const currentStep = getStep(currentId);

  const choose = (choice) => {
    const newSels = { ...selections, [currentId]: choice.value };
    setSelections(newSels);
    setHistory(h => [...h, choice.next]);
    setResult(null);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    setHistory(h => h.slice(0, -1));
    setResult(null);
  };

  const restart = () => {
    setHistory(['goal']);
    setSelections({});
    setInputs({ tableName: '', columnName: '', measureName: '' });
    setResult(null);
  };

  const generateResult = () => {
    if (!inputs.tableName || !inputs.columnName) return;

    let r = null;
    if (currentId === 'result_dax' || currentStep?.id === 'inputs_dax') return; // handled below

    const descKey = selections.calc_type || selections.time_type || selections.filter_type || selections.goal;

    if (currentId === 'inputs_dax') {
      r = generateDAX(descKey || 'součet', inputs.tableName, inputs.columnName, inputs.measureName);
      setResult({ type: 'dax', data: r });
      addToHistory({ type: 'DAX', ...inputs, description: descKey, result: r });
      setHistory(h => [...h, 'result_dax']);
    } else if (currentId === 'inputs_mq') {
      const op = selections.mq_op || selections.filter_type;
      r = generateMQuery(inputs.tableName, inputs.columnName, op, {});
      setResult({ type: 'mq', data: r });
      addToHistory({ type: 'MQuery', ...inputs, operation: op, result: r });
      setHistory(h => [...h, 'result_mq']);
    }
  };

  const progress = Math.round(((history.length - 1) / 3) * 100);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Map size={22} className="text-cyan-400" />
          Interaktivní průvodce
        </h1>
        <p className="text-gray-400 text-sm mt-1">Odpovídej na otázky – dostaneš doporučení a kód</p>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {history.length > 1 && (
          <button onClick={goBack} className="btn-ghost text-sm gap-1.5">
            <ArrowLeft size={15} /> Zpět
          </button>
        )}
        <div className="flex-1" />
        <button onClick={restart} className="btn-ghost text-sm text-gray-600 hover:text-gray-400">
          Začít znovu
        </button>
      </div>

      {/* Step breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        {history.map((id, i) => (
          <span key={id} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} />}
            <span className={i === history.length - 1 ? 'text-gray-300' : 'text-gray-600'}>
              {getStep(id)?.question?.slice(0, 30) || id}{i < history.length - 1 ? '…' : ''}
            </span>
          </span>
        ))}
      </div>

      {/* Current step */}
      {currentStep && (
        <div className="card p-6 animate-bounce-in">
          <h2 className="text-lg font-semibold text-gray-100 mb-5">{currentStep.question}</h2>

          {/* Choices */}
          {currentStep.type === 'choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.choices.map(c => (
                <button
                  key={c.value}
                  onClick={() => choose(c)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-brand-500/30 hover:text-white transition-all group text-left"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium">{c.label}</span>
                  <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* DAX inputs */}
          {currentStep.type === 'inputs_dax' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název tabulky</label>
                  <input value={inputs.tableName} onChange={e => setInputs(i => ({...i, tableName: e.target.value}))} placeholder="Objednávky" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název sloupce</label>
                  <input value={inputs.columnName} onChange={e => setInputs(i => ({...i, columnName: e.target.value}))} placeholder="Tržba" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Název míry (volitelné)</label>
                <input value={inputs.measureName} onChange={e => setInputs(i => ({...i, measureName: e.target.value}))} placeholder="CelkovéTržby" className="input" />
              </div>
              <button onClick={generateResult} disabled={!inputs.tableName || !inputs.columnName} className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                <Wand2 size={16} /> Generovat výsledek
              </button>
            </div>
          )}

          {/* MQ inputs */}
          {currentStep.type === 'inputs_mq' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název tabulky</label>
                  <input value={inputs.tableName} onChange={e => setInputs(i => ({...i, tableName: e.target.value}))} placeholder="MojeTabulka" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Název sloupce</label>
                  <input value={inputs.columnName} onChange={e => setInputs(i => ({...i, columnName: e.target.value}))} placeholder="Sloupec" className="input" />
                </div>
              </div>
              <button onClick={generateResult} disabled={!inputs.tableName || !inputs.columnName} className="btn-primary w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                <Wand2 size={16} /> Generovat M kód
              </button>
            </div>
          )}

          {/* Info */}
          {currentStep.type === 'info' && currentStep.content && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/3 border border-white/8">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{
                  __html: currentStep.content.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
                }} />
              </div>
              {currentStep.content.tip && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <Lightbulb size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300/80">{currentStep.content.tip}</p>
                </div>
              )}
              {currentStep.content.link && (
                <a href={currentStep.content.link} className="btn-primary text-sm justify-center">
                  Zobrazit podrobný návod <ChevronRight size={14} />
                </a>
              )}
            </div>
          )}

          {/* DAX result */}
          {(currentId === 'result_dax' && result?.type === 'dax') && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 text-emerald-400 font-medium mb-4">
                <Check size={16} /> Vygenerováno!
              </div>
              <CodeBlock code={result.data.code} language="dax" title="DAX" />
              <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                __html: result.data.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
              }} />
              {result.data.tips?.map((tip, i) => (
                <div key={i} className="flex gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Lightbulb size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300/80">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* MQ result */}
          {(currentId === 'result_mq' && result?.type === 'mq') && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 text-emerald-400 font-medium mb-4">
                <Check size={16} /> Vygenerováno!
              </div>
              <CodeBlock code={result.data.code} language="mquery" title="Power Query M" />
              <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                __html: result.data.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
              }} />
              {result.data.notes && (
                <div className="flex gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Lightbulb size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300/80">{result.data.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
