import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Sparkles, BookOpen, ChevronRight, Zap,
  Lightbulb, CheckCircle2, Key, Eye, EyeOff,
  AlertTriangle, ExternalLink, RefreshCw, Settings,
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// ─── Tutorials available in the app ───────────────────────────────────────────

const TUTORIALS = {
  'sloupcovy-graf':           'Sloupcový / Pruhový graf',
  'spojnicovy-graf':          'Spojnicový graf',
  'vysecovy-prstencovy-graf': 'Výsečový / Prstencový graf',
  'rozptylovy-graf':          'Rozptylový / Bublinový graf',
  'treemap-vizual':           'Treemap',
  'vodopady-graf':            'Vodopádový graf',
  'matice-vizual':            'Matice (Pivot)',
  'kpi-karta-dax':            'KPI karta s DAX',
  'calculate-funkce':         'Funkce CALCULATE',
  'datumova-tabulka':         'Datumová tabulka',
  'propojeni-tabulek':        'Propojení tabulek',
  'podminsene-formatovani':   'Podmíněné formátování',
  'drillthrough':             'Drillthrough',
  'selectedvalue-prurezy':    'SELECTEDVALUE a průřezy',
  'rankx-zebricek':           'RANKX – žebříček',
  'ytd-vypocet':              'YTD výpočet',
  'kumulativni-soucet':       'Kumulativní součet',
  'dax-miry-v-grafech':       'DAX míry v grafech',
  'pruvodce-co-kam':          'Průvodce: Co dát kam v grafu',
  'plan-vs-skutecnost':       'Plán vs. Skutečnost',
  'dynamicke-prepinani-metrik': 'Dynamické přepínání metrik',
};

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Jsi expert na Microsoft Power BI. Pomáháš českým uživatelům. Odpovídej VŽDY v JSON formátu.

Když uživatel popíše co chce udělat, odpověz POUZE platným JSON objektem (bez markdown, bez backticks, čistý JSON):

{
  "summary": "Co jsem pochopil z dotazu – 1–2 věty",
  "chart": {
    "name": "Název doporučeného vizuálu Power BI",
    "icon": "jedno emoji reprezentující graf",
    "reason": "Proč tento vizuál – 1 věta",
    "fields": [
      { "role": "Osa X", "value": "Datum[MěsícNázev]", "hint": "z datumové tabulky" }
    ],
    "steps": [
      "Krok 1 – **Záložka** → akce",
      "Krok 2 – **Oblast** → co přetáhnout"
    ]
  },
  "dax": [
    {
      "name": "NázevMíry",
      "code": "NázevMíry =\\nDAX kód s odsazením",
      "explanation": "Co tato míra dělá – 1–2 věty",
      "warning": null
    }
  ],
  "tips": ["Praktický tip 1", "Praktický tip 2"],
  "warnings": [],
  "tutorialIds": ["id1", "id2"]
}

Dostupné tutorialIds (uváděj max 3 nejrelevantnější):
${Object.entries(TUTORIALS).map(([id, name]) => `- ${id}: ${name}`).join('\n')}

Pravidla:
- Odpovídej VŽDY česky
- "chart" = null pokud dotaz je jen o DAX výpočtu bez vizuálu
- "dax" = [] pokud není potřeba žádný kód
- V "code" piš skutečný funkční DAX kód s newlines jako \\n
- V "steps" tučně (**text**) označuj názvy záložek, záložkách a UI prvků
- Buď konkrétní – přesné názvy záložek Power BI (Modelování, Formát, Analýza...)
- Pokud uživatel nezmiňuje tabulku/sloupec, použij generické Tabulka[Hodnota]`;

// ─── Groq API call ────────────────────────────────────────────────────────────

async function callAI(apiKey, userMessage) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${res.status}`;
    if (res.status === 401) throw new Error('Neplatný API klíč. Zkontroluj ho v nastavení.');
    if (res.status === 429) throw new Error('Překročen limit (free plán: 30 dotazů/min). Počkej chvíli a zkus znovu.');
    throw new Error('Chyba Groq API: ' + msg);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Prázdná odpověď od AI.');

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI nevrátila platný JSON. Zkus dotaz přeformulovat.');
  }
}

// ─── Quick examples ────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Chci zobrazit vývoj tržeb po měsících a porovnat s loňským rokem',
  'Koláčový graf s procentuálním podílem kategorií na celku',
  'Jak vypočítat YTD tržby a zobrazit je v KPI kartě',
  'Žebříček TOP 10 produktů podle tržeb se sloupcovým grafem',
  'Matice tržeb podle kategorie produktů a roku s tepelnou mapou',
  'Podmíněné formátování – zelená/červená barva podle splnění cíle',
  'Bodový graf korelace průměrné ceny a počtu objednávek zákazníků',
  'Kumulativní součet tržeb – jak postupně plníme roční cíl',
];

// ─── Color helper ─────────────────────────────────────────────────────────────

const COL = {
  chart: 'border-brand-500/25 bg-brand-500/3',
  dax:   'border-purple-500/25 bg-purple-500/3',
  tips:  'border-blue-500/15 bg-blue-500/3',
};

// ─── Setup screen ─────────────────────────────────────────────────────────────

function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 border border-purple-500/20 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Key size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-100">Nastav API klíč – je zdarma</h2>
            <p className="text-xs text-gray-500">Groq · Llama 3.3 70B · 30 req/min · zdarma</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p>Otevři <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">console.groq.com/keys <ExternalLink size={11} /></a> a přihlas se (Google / GitHub)</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p>Klikni na <strong className="text-gray-200">"Create API key"</strong> → pojmenuj ho (např. PowerBI)</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p>Zkopíruj klíč a vlož ho sem – <strong className="text-gray-200">ukládá se jen v tvém prohlížeči</strong></p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="gsk_..."
              className="input pr-10 font-mono text-sm"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            onClick={() => key.trim() && onSave(key.trim())}
            disabled={!key.trim()}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-50"
          >
            <Key size={15} /> Uložit klíč a začít
          </button>
        </div>

        <p className="text-xs text-gray-600 border-t border-white/5 pt-3">
          Klíč se ukládá do <code className="text-gray-500">localStorage</code> – nikam se neposílá, zůstane jen v tomto prohlížeči.
        </p>
      </div>
    </div>
  );
}

// ─── Result renderer ───────────────────────────────────────────────────────────

function ResultCard({ result }) {
  if (!result) return null;

  const { summary, chart, dax, tips, warnings, tutorialIds } = result;

  // Build tutorial list from IDs
  const tutorials = (tutorialIds || [])
    .filter(id => TUTORIALS[id])
    .map(id => ({ id, label: TUTORIALS[id] }));

  const hasContent = chart || (dax && dax.length > 0);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Summary */}
      {summary && (
        <div className="card p-4 border border-white/8 flex items-start gap-3">
          <Brain size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="card p-4 border border-yellow-500/20 space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex gap-2 text-xs text-yellow-300/80">
              <AlertTriangle size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chart && (
        <div className={`card p-5 border ${COL.chart} space-y-4`}>
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">{chart.icon || '📊'}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-100">{chart.name}</h3>
              {chart.reason && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{chart.reason}</p>}
            </div>
          </div>

          {/* Field mapping */}
          {chart.fields && chart.fields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Co přetáhnout kam</p>
              <div className="space-y-1.5">
                {chart.fields.map((f, i) => (
                  <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-brand-500/10 text-brand-400 border-brand-500/20 flex-shrink-0 self-start">
                      {f.role}
                    </span>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs text-gray-200 font-mono break-all">{f.value}</code>
                      {f.hint && <p className="text-[11px] text-gray-500 mt-0.5">{f.hint}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {chart.steps && chart.steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Krok za krokem</p>
              <div className="space-y-1.5">
                {chart.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-300 leading-snug"
                      dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DAX codes */}
      {dax && dax.length > 0 && (
        <div className={`card p-5 border ${COL.dax} space-y-5`}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-purple-400" />
            <h3 className="font-semibold text-gray-100">
              {dax.length === 1 ? 'DAX míra' : `${dax.length} DAX míry`}
            </h3>
          </div>

          {dax.map((d, i) => (
            <div key={i} className="space-y-2">
              <CodeBlock code={d.code} language="dax" title={d.name} />
              {d.explanation && (
                <p className="text-xs text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: d.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                />
              )}
              {d.warning && (
                <div className="flex gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                  <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/80">{d.warning}</p>
                </div>
              )}
            </div>
          ))}

          {!chart && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Jak míru přidat</p>
              {[
                'Klikni pravým na tabulku v záložce **Pole** → **Nová míra**',
                'Vlož kód výše, stiskni Enter',
                'Nastav formát (Kč, %, ks) v záložce **Nástroje měření**',
                'Přetáhni míru do grafu nebo karty',
              ].map((s, i) => (
                <div key={i} className="flex gap-3 p-2 rounded-lg bg-white/3 border border-white/5 mb-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-purple-500/10 text-purple-400 border border-purple-500/20">{i + 1}</span>
                  <p className="text-xs text-gray-300 leading-snug"
                    dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No useful content */}
      {!hasContent && (
        <div className="card p-5 border border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={15} className="text-yellow-400" />
            <p className="text-sm font-medium text-gray-200">Zkus dotaz upřesnit</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Přidej klíčová slova: <span className="text-gray-200">tržby, vývoj, porovnat, součet, průměr, podíl, trend, loňský rok, YTD, žebříček…</span>
          </p>
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className={`card p-4 border ${COL.tips} space-y-2`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tipy a vychytávky</p>
          {tips.map((t, i) => (
            <div key={i} className="flex gap-2 text-xs text-blue-300/80">
              <Lightbulb size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tutorials */}
      {tutorials.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={13} className="text-brand-400" />
            <p className="text-xs font-semibold text-gray-400">Doporučené návody</p>
          </div>
          <div className="space-y-1.5">
            {tutorials.map((t, i) => (
              <Link
                key={i}
                to={`/tutorials/${t.id}`}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 hover:border-brand-500/20 transition-all group"
              >
                <CheckCircle2 size={12} className="text-brand-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 group-hover:text-white flex-1">{t.label}</span>
                <ChevronRight size={11} className="text-gray-600 group-hover:text-brand-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SmartAssistant() {
  const [apiKey, setApiKey] = useState(() =>
    localStorage.getItem('pbi_ai_key') || localStorage.getItem('pbi_gemini_key') || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveKey = (key) => {
    localStorage.setItem('pbi_ai_key', key);
    setApiKey(key);
    setShowSettings(false);
  };

  const removeKey = () => {
    localStorage.removeItem('pbi_ai_key');
    localStorage.removeItem('pbi_gemini_key');
    setApiKey('');
    setResult(null);
    setError('');
  };

  const analyze = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !apiKey) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await callAI(apiKey, input);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex) => {
    setInput(ex);
    setResult(null);
    setError('');
  };

  // No API key → show setup
  if (!apiKey) return <ApiKeySetup onSave={saveKey} />;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Brain size={22} className="text-purple-400" />
            Chytrý asistent
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">AI</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Napiš co chceš udělat – Groq AI ti odpoví</p>
        </div>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="btn-ghost text-xs gap-1.5 flex-shrink-0"
        >
          <Settings size={13} /> API klíč
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card p-4 border border-purple-500/20 animate-slide-up space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Nastavení API klíče</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                defaultValue={apiKey}
                onBlur={e => e.target.value && saveKey(e.target.value)}
                className="input pr-9 font-mono text-xs"
              />
              <button onClick={() => setShowKey(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <button onClick={removeKey} className="btn-ghost text-xs text-red-400 hover:text-red-300">Odebrat</button>
          </div>
          <p className="text-[11px] text-gray-600">
            Klíč z <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400">console.groq.com/keys</a> · Uložen jen v prohlížeči · Zdarma: 30 req/min
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: input + result ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Input */}
          <div className="card p-5">
            <form onSubmit={analyze} className="space-y-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze(); }}
                placeholder="Napiste co chcete – napr. Zobrazit vyvoj trzeb po mesicich a porovnat s lonskim rokem..."
                className="textarea h-28 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Přemýšlím…</>
                    : <><Sparkles size={15} /> Zeptat se AI</>
                  }
                </button>
                {(result || error) && (
                  <button type="button" onClick={() => { setResult(null); setError(''); }}
                    className="btn-ghost text-sm text-gray-600 gap-1">
                    <RefreshCw size={13} /> Reset
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-600">Ctrl+Enter · Groq Llama 3.3 · Zdarma</p>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="card p-4 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Chyba</p>
                <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          <ResultCard result={result} />
        </div>

        {/* ── Right: examples + info ── */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" /> Příklady dotazů
            </h3>
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all group ${
                    input === ex
                      ? 'bg-brand-500/10 border-brand-500/30'
                      : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/15'
                  }`}
                >
                  <p className="text-xs text-gray-300 group-hover:text-white leading-snug">{ex}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Brain size={14} className="text-purple-400" /> Co umí
            </h3>
            <div className="space-y-1.5 text-xs text-gray-400">
              {[
                ['📊', 'Doporučí vizuál + nastavení polí'],
                ['✨', 'Vygeneruje DAX kód'],
                ['📋', 'Průvodce krok za krokem'],
                ['📚', 'Odkáže na návody'],
                ['🧠', 'Rozumí volným větám česky'],
                ['🔒', 'Klíč jen v prohlížeči · Groq zdarma'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
