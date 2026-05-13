import { useState } from 'react';
import { BarChart2, Lightbulb, Search, Zap, ChevronRight, Info } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// ─── Chart rules database ─────────────────────────────────────────────────────

const chartRules = [
  {
    id: 'stacked-column',
    name: 'Skládaný sloupcový graf',
    englishName: 'Stacked Column Chart',
    icon: '📊',
    color: 'blue',
    keys: ['pohlaví','mužů a žen','muži a ženy','gend','dva typy','dvě skupiny','skupiny v','složení v','z čeho se skládá v každém','podíl v každém','složení podle'],
    useCase: 'Zobrazuje složení kategorií — kolik z každé skupiny tvoří každou kategorii. Ideální pro pohlaví, věkové skupiny nebo kategorie produktů v rámci oddělení.',
    fields: [
      { role: 'Osa X', hint: 'Hlavní kategorie (co srovnáváš)', example: 'Oddělení, Region, Produkt' },
      { role: 'Hodnoty (Y)', hint: 'Co chceš měřit', example: 'COUNTROWS(Tabulka) nebo SUM(...)' },
      { role: 'Legenda', hint: 'Co tvoří barevné vrstvy sloupce', example: 'Pohlaví, Věková skupina, Typ' },
    ],
    daxExample: 'PočetZaměstnanců = COUNTROWS(Zaměstnanci)',
    tips: [
      'Zvažuj skládaný (stacked) pro složení nebo seskupený (clustered) pro přímé srovnání',
      'Legenda by měla mít max. 5–6 hodnot',
      'Zapni datové popisky pro přesná čísla',
    ],
    alternatives: ['Seskupený sloupcový (vedle sebe místo nad sebou)', '100% skládaný (relativní podíly)'],
  },
  {
    id: 'clustered-column',
    name: 'Seskupený sloupcový graf',
    englishName: 'Clustered Column Chart',
    icon: '📊',
    color: 'blue',
    keys: ['srovnání','porovnat','v každém','podle','mezi','ranking','kolik v','nejlepší','nejvíce','nejméně','top','žebříček','pořadí','v jednotlivých','pro každé','vedle sebe'],
    useCase: 'Porovnává hodnoty mezi kategoriemi. Nejuniverzálnější graf v Power BI.',
    fields: [
      { role: 'Osa X', hint: 'Kategorie, které chceš porovnat', example: 'Produkt, Region, Zaměstnanec, Oddělení' },
      { role: 'Hodnoty (Y)', hint: 'Co chceš měřit pro každou kategorii', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
      { role: 'Legenda', hint: 'Doplňující rozdělení (volitelné)', example: 'Rok, Kategorie — nechej prázdné pro jednoduchý graf' },
    ],
    daxExample: 'CelkovéTržby = SUM(Objednávky[Tržba])',
    tips: [
      'Max. 15 kategorií na ose X',
      'Pro TOP N: přidej filtr vizuálu → Top N',
      'Seřaď sestupně pro žebříček',
    ],
    alternatives: ['Pruhový graf (vodorovný) pro dlouhé názvy kategorií'],
  },
  {
    id: 'line',
    name: 'Spojnicový graf',
    englishName: 'Line Chart',
    icon: '📈',
    color: 'green',
    keys: ['trend','vývoj','průběh','v čase','časový','měsíčně','ročně','za rok','za měsíc','historicky','roste','klesá','výkyvy','denně','týdně','čtvrtletně','časová řada','jak se vyvíjí','jak roste','jak klesá'],
    useCase: 'Sleduje hodnoty v čase. Ideální pro tržby po měsících, počet uživatelů po týdnech nebo jakékoli časové řady.',
    fields: [
      { role: 'Osa X', hint: 'Časová dimenze (z datumové tabulky!)', example: 'Datum[MěsícNázev], Datum[Rok], Datum[Týden]' },
      { role: 'Hodnoty (Y)', hint: 'Metrika, jejíž vývoj chceš vidět', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
      { role: 'Legenda', hint: 'Pro více linií — doplňující kategorie', example: 'Produkty[Kategorie] → každá kategorie = samostatná linie' },
    ],
    daxExample: 'TržbyMTD = CALCULATE(SUM(Objednávky[Tržba]), DATESMTD(Datum[Datum]))',
    tips: [
      'Vždy používej datumovou tabulku, ne datum z faktové tabulky',
      'Přidej klouzavý průměr (záložka Analýza)',
      'Vypni "Kategorie" a ponech jen hodnoty pro čistý trend',
    ],
    alternatives: ['Plošný graf (Area) pro zdůraznění objemu', 'Sloupcový pro porovnání konkrétních období'],
  },
  {
    id: 'pie',
    name: 'Koláčový / Prstencový graf',
    englishName: 'Pie / Donut Chart',
    icon: '🥧',
    color: 'orange',
    keys: ['podíl','procento','z celku','jak velký','část celku','složení','struktura','jak se dělí','kolik procent','jaký podíl','proporce','rozdělení na'],
    useCase: 'Zobrazuje podíl kategorií na celku. Použij pouze pro 2–6 kategorií.',
    fields: [
      { role: 'Legenda', hint: 'Kategorie (výseče)', example: 'Produkty[Kategorie], Region[Název]' },
      { role: 'Hodnoty', hint: 'Metrika určující velikost výseče', example: 'SUM(Objednávky[Tržba])' },
    ],
    daxExample: 'ProcentoZCelku = DIVIDE(SUM(Objednávky[Tržba]), CALCULATE(SUM(Objednávky[Tržba]), ALL(Objednávky)))',
    tips: [
      'Maximálně 6 kategorií – jinak použij sloupcový',
      'Zapni popisky s procentem',
      'Prstencový (donut) je modernější alternativa',
    ],
    alternatives: ['Treemap pro hierarchická data', 'Sloupcový 100% skládaný pro srovnání podílů ve více kategoriích'],
  },
  {
    id: 'scatter',
    name: 'Rozptylový graf',
    englishName: 'Scatter Plot / Bubble Chart',
    icon: '⚬',
    color: 'purple',
    keys: ['korelace','vztah mezi','závisí','závislost','porovnat dvě metriky','porovnat dvě hodnoty','bubble','osa x a y','scatter','dvě osy','vs','cena a množství','výkon a náklady'],
    useCase: 'Odhaluje vztah (korelaci) mezi dvěma metrikami. Každý bod = jedna entita (zákazník, produkt, region).',
    fields: [
      { role: 'Osa X', hint: 'První metrika (horizontální)', example: 'Průměrná cena, Počet objednávek' },
      { role: 'Osa Y', hint: 'Druhá metrika (vertikální)', example: 'Celkové tržby, Ziskovost' },
      { role: 'Hodnoty / Detail', hint: 'Co každý bod představuje', example: 'Zákazníci[Název], Produkty[Název]' },
      { role: 'Velikost', hint: 'Třetí metrika (velikost bublin)', example: 'Počet objednávek, Marže (volitelné)' },
    ],
    daxExample: 'PrůměrnáObjednávka = AVERAGE(Objednávky[Hodnota])',
    tips: [
      'Osa X i Y musí být míry (ne kategorie)',
      'Přidej trend linii v záložce Analýza',
      'Play Axis (čas) animuje vývoj bublin v čase',
    ],
    alternatives: ['Spojnicový pro sledování jedné metriky v čase'],
  },
  {
    id: 'treemap',
    name: 'Treemap',
    englishName: 'Treemap',
    icon: '🟩',
    color: 'green',
    keys: ['hierarchie','podkategorie','zanořené','největší','které produkty','které kategorie','proporce v kategorii','stromový','rozložení produktů','portfolio'],
    useCase: 'Zobrazuje hierarchická data jako vnořené obdélníky – velikost = metrika, barva = kategorie.',
    fields: [
      { role: 'Skupina', hint: 'Hlavní kategorie (vnější úroveň)', example: 'Produkty[Kategorie]' },
      { role: 'Podrobnosti', hint: 'Podkategorie (vnitřní úroveň, drill)', example: 'Produkty[Název]' },
      { role: 'Hodnoty', hint: 'Určuje velikost obdélníků', example: 'SUM(Objednávky[Tržba])' },
    ],
    daxExample: 'TržbyProduktu = SUM(Objednávky[Tržba])',
    tips: [
      'Bez Podrobností vidíš jen kategorii',
      'S Podrobnostmi lze drillovat kliknutím',
      'Barva může zobrazit jinou metriku (např. marži)',
    ],
    alternatives: ['Koláčový pro jednoduchou proporci bez hierarchie', 'Sloupcový pro přesné porovnání hodnot'],
  },
  {
    id: 'waterfall',
    name: 'Vodopádový graf',
    englishName: 'Waterfall Chart',
    icon: '📉',
    color: 'teal',
    keys: ['vodopád','waterfall','bridge','přírůstek','úbytek','nárůst a pokles','jak se dostaneme','změny','finanční analýza','výsledovka','od startu k cíli','kumulativní změny','faktory ovlivňující'],
    useCase: 'Zobrazuje postupné přírůstky a úbytky vedoucí k výsledku. Ideální pro finanční analýzy, bridge charty.',
    fields: [
      { role: 'Kategorie', hint: 'Kroky / faktory změny', example: 'Měsíc, Produkt, Kanál, Typ nákladu' },
      { role: 'Hodnoty (Y)', hint: 'Velikost změny (kladná = přírůstek, záporná = úbytek)', example: 'SUM(Finance[Změna])' },
      { role: 'Breakdown', hint: 'Druhá dimenze pro detailní rozpad (volitelné)', example: 'Finance[Kategorie]' },
    ],
    daxExample: 'ZměnaTržeb = [CelkovéTržby] - [TržbyMinulýMěsíc]',
    tips: [
      'Nastav první a poslední sloupec jako "Celkový" (ne přírůstek)',
      'Záporné hodnoty = červené, kladné = zelené (výchozí nastavení)',
      'Waterfall nefunguje dobře s více než 10–12 kroky',
    ],
    alternatives: ['Sloupcový seskupený pro přímé srovnání bez kumulace'],
  },
  {
    id: 'card',
    name: 'KPI Karta',
    englishName: 'Card / KPI',
    icon: '🎯',
    color: 'yellow',
    keys: ['celkový počet','jedna hodnota','kpi','karta','ukazatel','výsledek','celkem','kolik celkem','jedno číslo','zobrazit číslo','jak velká je','aktuální hodnota'],
    useCase: 'Zobrazuje jednu klíčovou metriku prominentně. Základní stavební kámen každého dashboardu.',
    fields: [
      { role: 'Hodnoty (pole)', hint: 'Jedna míra nebo agregace', example: 'SUM(Tržby), COUNTROWS(Zákazníci), [CelkovéTržby]' },
    ],
    daxExample: 'CelkovéTržby = SUM(Objednávky[Tržba])',
    tips: [
      'KPI karta: přidej Cíl (Target) a zobrazí procentuální splnění',
      'Novější vizuál "Karta (nová)" podporuje sparkline',
      'Podmíněné formátování: červená/zelená podle splnění cíle',
    ],
    alternatives: ['Gauge pro zobrazení hodnoty vůči cíli s ciferníkem'],
  },
  {
    id: 'matrix',
    name: 'Matice (Matrix)',
    englishName: 'Matrix / Pivot Table',
    icon: '📋',
    color: 'gray',
    keys: ['tabulka','matrix','kontingenční','křížové','řádky a sloupce','matice','produkt po měsících','srovnat přes dvě dimenze','rok a produkt','oddělení a rok','kategorie a čas'],
    useCase: 'Křížová tabulka — porovnání hodnot přes dvě dimenze (řádky × sloupce). Ekvivalent pivot tabulky v Excelu.',
    fields: [
      { role: 'Řádky', hint: 'První dimenze (řádky)', example: 'Produkty[Kategorie], Zaměstnanci[Oddělení]' },
      { role: 'Sloupce', hint: 'Druhá dimenze (záhlaví sloupců)', example: 'Datum[Rok], Datum[Čtvrtletí]' },
      { role: 'Hodnoty', hint: 'Co se zobrazí v buňkách', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
    ],
    daxExample: 'TržbyPodleRokuAKategorie = SUM(Objednávky[Tržba])',
    tips: [
      'Přidej podmíněné formátování → tepelná mapa',
      'Zapni mezisoučty pro přehled na úrovni skupiny',
      'Hierarchie v Řádcích umožňuje drill (Kategorie → Produkt)',
    ],
    alternatives: ['Sloupcový pro méně kombinací dimenzí'],
  },
];

// ─── Matching logic ───────────────────────────────────────────────────────────

function matchChart(input) {
  const lower = input.toLowerCase();
  for (const rule of chartRules) {
    if (rule.keys.some(k => lower.includes(k))) {
      return rule;
    }
  }
  // Default: clustered column
  return chartRules.find(r => r.id === 'clustered-column');
}

function extractEntities(input) {
  const lower = input.toLowerCase();
  const hints = {};

  if (lower.includes('oddělení')) hints.xExample = 'Zaměstnanci[Oddělení]';
  if (lower.includes('region')) hints.xExample = 'Region[Název]';
  if (lower.includes('produkt')) hints.xExample = 'Produkty[Název]';
  if (lower.includes('kategori')) hints.xExample = 'Produkty[Kategorie]';

  if (lower.includes('pohlaví') || lower.includes('mužů') || lower.includes('žen') || lower.includes('muži') || lower.includes('ženy')) {
    hints.legendExample = 'Zaměstnanci[Pohlaví]';
  }
  if (lower.includes('rok')) hints.legendExample = 'Datum[Rok]';

  if (lower.includes('kolik') || lower.includes('počet')) hints.valueExample = 'COUNTROWS(Tabulka)';
  if (lower.includes('tržb') || lower.includes('prodej')) hints.valueExample = 'SUM(Objednávky[Tržba])';
  if (lower.includes('cena')) hints.valueExample = 'AVERAGE(Produkty[Cena])';
  if (lower.includes('zisk') || lower.includes('marž')) hints.valueExample = 'SUM(Finance[Zisk])';

  return hints;
}

function personalizeFields(fields, hints) {
  return fields.map(f => {
    let ex = f.example;
    const role = f.role.toLowerCase();
    if ((role.includes('osa x') || role.includes('kategorie') || role.includes('skupina') || role.includes('řádky')) && hints.xExample) {
      ex = hints.xExample + ' (nebo ' + f.example + ')';
    }
    if (role.includes('legenda') && hints.legendExample) {
      ex = hints.legendExample + ' (nebo ' + f.example + ')';
    }
    if ((role.includes('hodnot') || role.includes('osa y')) && hints.valueExample) {
      ex = hints.valueExample + ' (nebo ' + f.example + ')';
    }
    return { ...f, example: ex };
  });
}

// ─── Color maps ───────────────────────────────────────────────────────────────

const colorMap = {
  blue:   { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   card: 'border-blue-500/20',   icon: 'text-blue-400' },
  green:  { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', card: 'border-emerald-500/20', icon: 'text-emerald-400' },
  orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', card: 'border-orange-500/20', icon: 'text-orange-400' },
  purple: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', card: 'border-purple-500/20', icon: 'text-purple-400' },
  teal:   { badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',   card: 'border-teal-500/20',   icon: 'text-teal-400' },
  yellow: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', card: 'border-yellow-500/20', icon: 'text-yellow-400' },
  gray:   { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',   card: 'border-gray-500/20',   icon: 'text-gray-400' },
};

// ─── Quick examples ───────────────────────────────────────────────────────────

const quickExamples = [
  'Kolik mužů a žen je v každém oddělení',
  'Vývoj tržeb po měsících za poslední rok',
  'Podíl jednotlivých kategorií na celkových tržbách',
  'Korelace mezi průměrnou cenou a počtem objednávek zákazníků',
  'Tržby jednotlivých produktů – které jsou největší',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChartAdvisor() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdvisory = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const chart = matchChart(input);
      const hints = extractEntities(input);
      const personalizedFields = personalizeFields(chart.fields, hints);
      setResult({ chart, personalizedFields });
      setLoading(false);
    }, 350);
  };

  const loadExample = (ex) => {
    setInput(ex);
    setResult(null);
  };

  const colors = result ? (colorMap[result.chart.color] || colorMap.blue) : null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <BarChart2 size={22} className="text-yellow-400" />
          Průvodce výběrem grafu
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Popiš, co chceš zobrazit – dostaneš doporučení grafu a nastavení polí
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – input + result */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 space-y-4">
            <form onSubmit={handleAdvisory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Co chceš zobrazit? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Např. Chci zobrazit kolik mužů a žen je v každém oddělení…"
                  className="textarea h-24"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Piš přirozeně česky. Napiš co chceš vidět – aplikace pozná správný typ grafu.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary w-full justify-center py-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={17} />
                )}
                {loading ? 'Analyzuji…' : 'Doporučit graf'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`card p-6 space-y-5 animate-slide-up border ${colors.card}`}>
              {/* Chart title */}
              <div className="flex items-start gap-3">
                <span className="text-3xl leading-none mt-0.5">{result.chart.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-100">{result.chart.name}</h2>
                  <span className={`badge border text-xs mt-1 inline-block ${colors.badge}`}>
                    {result.chart.englishName}
                  </span>
                </div>
              </div>

              {/* Use case */}
              <div className="p-3 rounded-lg bg-white/3 border border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed">{result.chart.useCase}</p>
              </div>

              {/* Field mapping */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Co dát kam
                </h3>
                <div className="space-y-2">
                  {result.personalizedFields.map((f, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5"
                    >
                      <div className="w-28 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${colors.badge}`}>
                          {f.role}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 leading-snug">{f.hint}</p>
                        <p className="text-xs text-gray-200 font-mono mt-1 break-words">{f.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DAX example */}
              {result.chart.daxExample && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Příklad DAX míry
                  </h3>
                  <CodeBlock
                    code={result.chart.daxExample}
                    language="dax"
                    title="DAX"
                    onExport={false}
                  />
                </div>
              )}

              {/* Tips */}
              {result.chart.tips?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Tipy
                  </h3>
                  <div className="space-y-2">
                    {result.chart.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <Lightbulb size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-300/80">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {result.chart.alternatives?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Alternativy
                  </h3>
                  <div className="space-y-1.5">
                    {result.chart.alternatives.map((alt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <ChevronRight size={12} className="text-gray-600 flex-shrink-0" />
                        {alt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right – quick examples + hint */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-yellow-400" /> Rychlé příklady
            </h3>
            <div className="space-y-2">
              {quickExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="w-full text-left p-3 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/15 transition-all group"
                >
                  <p className="text-xs text-gray-300 group-hover:text-white leading-snug">{ex}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Info size={15} className="text-gray-500" /> Jak to funguje
            </h3>
            <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <p>Průvodce analyzuje tvůj popis a doporučí vhodný typ grafu spolu s tím, co přesně přetáhnout do polí Power BI.</p>
              <p className="text-gray-600">Klíčová slova jako <span className="text-gray-400 italic">pohlaví, trend, podíl, korelace, hierarchie</span> ovlivňují výsledek.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
