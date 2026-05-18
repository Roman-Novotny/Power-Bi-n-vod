import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Sparkles, BookOpen, ChevronRight, Zap,
  BarChart2, Lightbulb, CheckCircle2, Send,
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// ─── Chart detection ──────────────────────────────────────────────────────────

const CHART_RULES = [
  {
    id: 'line', name: 'Spojnicový graf', icon: '📈', color: 'green',
    keys: ['trend', 'vývoj', 'v čase', 'po měsících', 'měsíčně', 'ročně', 'denně', 'týdně', 'čtvrtletně', 'časová řada', 'jak roste', 'jak klesá', 'průběh', 'historicky', 'výkyvy'],
    tutorialId: 'spojnicovy-graf',
    fieldMap: (e) => [
      { role: 'Osa X', val: 'Datum[MěsícNázev]  ← z datumové tabulky' },
      { role: 'Hodnoty Y', val: `SUM(${e.T}[${e.C}])` },
      { role: 'Legenda', val: e.DIM ? `${e.T}[${e.DIM}]  ← více linií` : '(volitelné – kategorie pro více linií)' },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Spojnicový graf** z panelu Vizualizace`,
      `**Osa X** → Datum[MěsícNázev] (musí být z datumové tabulky!)`,
      `**Hodnoty Y** → míra SUM(${e.T}[${e.C}])`,
      e.DIM ? `**Legenda** → ${e.T}[${e.DIM}] pro zobrazení více linií` : `**Legenda** → přidej kategorii pro více linií (volitelné)`,
      `Záložka **Analýza** → Klouzavý průměr nebo Referenční čára (cíl)`,
    ],
  },
  {
    id: 'clustered-column', name: 'Sloupcový seskupený', icon: '📊', color: 'blue',
    keys: ['porovnat', 'srovnat', 'nejlepší', 'nejhorší', 'top', 'žebříček', 'pořadí', 'v každém', 'podle', 'ranking', 'kolik v', 'vedle sebe', 'mezi regiony', 'mezi produkty', 'mezi zákazníky'],
    tutorialId: 'sloupcovy-graf',
    fieldMap: (e) => [
      { role: 'Osa X', val: `${e.T}[${e.DIM || 'Kategorie'}]  ← co porovnáváš` },
      { role: 'Hodnoty Y', val: `SUM(${e.T}[${e.C}])` },
      { role: 'Legenda', val: '(volitelné – druhá dimenze)' },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Sloupcový seskupený** z panelu Vizualizace`,
      `**Osa X** → ${e.T}[${e.DIM || 'Kategorie'}]`,
      `**Hodnoty Y** → míra SUM(${e.T}[${e.C}])`,
      `Seřazení: klikni **"..."** u grafu → Seřadit podle → sestupně`,
      `TOP N: záložka Filtry vizuálu → Typ filtru: **Top N** → zadej počet`,
    ],
  },
  {
    id: 'stacked-column', name: 'Skládaný sloupcový', icon: '📊', color: 'blue',
    keys: ['složení', 'pohlaví', 'muži a ženy', 'skupiny', 'co tvoří', 'vrstvy', 'skládaný', 'stacked'],
    tutorialId: 'sloupcovy-graf',
    fieldMap: (e) => [
      { role: 'Osa X', val: `${e.T}[${e.DIM || 'Kategorie'}]  ← hlavní kategorie` },
      { role: 'Hodnoty Y', val: `COUNTROWS(${e.T}) nebo SUM(${e.T}[${e.C}])` },
      { role: 'Legenda', val: `${e.T}[Pohlaví] nebo [Typ]  ← tvoří barevné vrstvy` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Sloupcový skládaný** z panelu Vizualizace`,
      `**Osa X** → hlavní kategorie (${e.T}[${e.DIM || 'Oddělení'}])`,
      `**Hodnoty Y** → co měříš (COUNTROWS nebo SUM)`,
      `**Legenda** → co tvoří vrstvy sloupce (Pohlaví, Typ, ...)`,
      `Záložka Formát → zapni **Datové popisky** pro přesná čísla`,
    ],
  },
  {
    id: 'pie', name: 'Koláčový / Prstencový', icon: '🥧', color: 'orange',
    keys: ['podíl', 'procento', 'z celku', 'kolik procent', 'struktura', 'prstencový', 'koláčový', 'výsečový', 'donut', 'jaký podíl', 'jak se dělí'],
    tutorialId: 'vysecovy-prstencovy-graf',
    fieldMap: (e) => [
      { role: 'Legenda', val: `${e.T}[${e.DIM || 'Kategorie'}]  ← výseče` },
      { role: 'Hodnoty', val: `SUM(${e.T}[${e.C}])` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Koláčový** nebo **Prstencový** z panelu Vizualizace`,
      `**Legenda** → kategorie (${e.T}[${e.DIM || 'Kategorie'}])`,
      `**Hodnoty** → míra SUM(${e.T}[${e.C}])`,
      `Záložka Formát → Datové popisky → zapni **"% z celku"**`,
      `⚠️ Max. **5–6 kategorií** – více = nečitelné (použij sloupcový)`,
    ],
  },
  {
    id: 'scatter', name: 'Bodový / Bublinový', icon: '⚬', color: 'purple',
    keys: ['korelace', 'závislost', 'vztah mezi', 'dvě metriky', 'scatter', 'bubble', 'osa x a y', 'závisí na'],
    tutorialId: 'rozptylovy-graf',
    fieldMap: (e) => [
      { role: 'Osa X', val: `AVERAGE(${e.T}[Cena])  ← první metrika` },
      { role: 'Osa Y', val: `SUM(${e.T}[${e.C}])  ← druhá metrika` },
      { role: 'Detail', val: `${e.T}[Název]  ← co každý bod je` },
      { role: 'Velikost', val: `COUNTROWS(${e.T})  ← třetí metrika (volitelné)` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Bodový graf** z panelu Vizualizace`,
      `**Osa X** → první metrika (průměrná cena, počet)`,
      `**Osa Y** → druhá metrika SUM(${e.T}[${e.C}])`,
      `**Detail** → co každý bod představuje (${e.T}[Název])`,
      `Záložka **Analýza** → přidej **Trend linii** (lineární regrese)`,
    ],
  },
  {
    id: 'card', name: 'KPI Karta', icon: '🎯', color: 'yellow',
    keys: ['jedno číslo', 'kpi', 'karta', 'klíčová metrika', 'celkový výsledek', 'jeden ukazatel', 'prominentní číslo'],
    tutorialId: 'kpi-karta-dax',
    fieldMap: (e) => [
      { role: 'Hodnoty', val: `SUM(${e.T}[${e.C}])  ← jedna míra` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Karta** nebo **KPI** z panelu Vizualizace`,
      `**Hodnoty** → vlož míru SUM(${e.T}[${e.C}])`,
      `Nastav **formát** míry (Kč, %, ks) v záložce Nástroje měření`,
      `Pro KPI: přidej **Cíl** (Target) pro zobrazení % splnění`,
      `Nový vizuál **"Karta (nová)"** (2024+): podporuje sparkline v kartě`,
    ],
  },
  {
    id: 'matrix', name: 'Matice (Pivot tabulka)', icon: '📋', color: 'gray',
    keys: ['tabulka', 'pivot', 'matice', 'křížová tabulka', 'řádky a sloupce', 'a rok', 'a čtvrtletí', 'a měsíc'],
    tutorialId: 'matice-vizual',
    fieldMap: (e) => [
      { role: 'Řádky', val: `${e.T}[${e.DIM || 'Kategorie'}]  ← první dimenze` },
      { role: 'Sloupce', val: `Datum[Rok]  ← druhá dimenze` },
      { role: 'Hodnoty', val: `SUM(${e.T}[${e.C}])` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Matice** z panelu Vizualizace`,
      `**Řádky** → ${e.T}[${e.DIM || 'Kategorie'}]`,
      `**Sloupce** → Datum[Rok] nebo Datum[Čtvrtletí]`,
      `**Hodnoty** → míra SUM(${e.T}[${e.C}])`,
      `Podmíněné formátování → **Barevná škála** = tepelná mapa`,
    ],
  },
  {
    id: 'waterfall', name: 'Vodopádový graf', icon: '📉', color: 'teal',
    keys: ['přírůstek', 'úbytek', 'vodopád', 'waterfall', 'bridge', 'jak jsme se dostali', 'změny oproti'],
    tutorialId: 'vodopady-graf',
    fieldMap: (e) => [
      { role: 'Kategorie', val: `Datum[MěsícNázev]  ← kroky` },
      { role: 'Hodnoty Y', val: `[ZměnaTržeb]  ← míra zobrazující ZMĚNU` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Vodopádový graf** z panelu Vizualizace`,
      `**Kategorie** → kroky (Datum[Měsíc], Finance[Faktor])`,
      `**Hodnoty Y** → míra zobrazující ZMĚNU (ne absolutní hodnotu!)`,
      `Klikni pravým na 1. a poslední sloupec → **"Nastavit jako celkový"**`,
      `Formát → Barvy dat: Zvýšení=zelená, Snížení=červená`,
    ],
  },
  {
    id: 'treemap', name: 'Treemap', icon: '🟩', color: 'green',
    keys: ['hierarchie', 'podkategorie', 'stromový', 'treemap', 'největší kategorie', 'portfolio', 'vnořené'],
    tutorialId: 'treemap-vizual',
    fieldMap: (e) => [
      { role: 'Skupina', val: `${e.T}[Kategorie]  ← vnější úroveň` },
      { role: 'Podrobnosti', val: `${e.T}[Název]  ← drill-down (volitelné)` },
      { role: 'Hodnoty', val: `SUM(${e.T}[${e.C}])  ← velikost obdélníku` },
    ],
    setupSteps: (e) => [
      `Přidej vizuál **Treemap** z panelu Vizualizace`,
      `**Skupina** → hlavní kategorie (${e.T}[Kategorie])`,
      `**Podrobnosti** → podkategorie pro drill (${e.T}[Název])`,
      `**Hodnoty** → metrika = velikost (SUM(${e.T}[${e.C}]))`,
      `Kliknutím na obdélník = drilldown do podkategorie`,
    ],
  },
];

// ─── DAX pattern detection ─────────────────────────────────────────────────────

const DAX_RULES = [
  {
    id: 'sum',
    keys: ['součet', 'celková', 'celkové', 'sečíst', 'suma', 'celkem', 'total', 'sčítat'],
    generate: (T, C, M) => ({
      name: M || `Celkové${C}`,
      code: `${M || `Celkové${C}`} = SUM(${T}[${C}])`,
      explanation: `**SUM** sečte všechny hodnoty sloupce [${C}] v aktuálním kontextu filtru. Výsledek se automaticky mění při použití průřezů.`,
    }),
  },
  {
    id: 'average',
    keys: ['průměr', 'průměrná', 'průměrné', 'average', 'střední hodnota'],
    generate: (T, C, M) => ({
      name: M || `Průměrné${C}`,
      code: `${M || `Průměrné${C}`} = AVERAGE(${T}[${C}])`,
      explanation: `**AVERAGE** vypočítá aritmetický průměr hodnot sloupce [${C}].`,
    }),
  },
  {
    id: 'count',
    keys: ['počet', 'kolik záznamů', 'kolik řádků', 'počet řádků', 'countrows'],
    generate: (T, C, M) => ({
      name: M || `Počet${T}`,
      code: `${M || `Počet${T}`} = COUNTROWS(${T})`,
      explanation: `**COUNTROWS** počítá počet řádků tabulky **${T}** v aktuálním kontextu filtru.`,
    }),
  },
  {
    id: 'distinctcount',
    keys: ['unikátní', 'jedinečných', 'distinct', 'různých hodnot'],
    generate: (T, C, M) => ({
      name: M || `Unikátní${C}`,
      code: `${M || `Unikátní${C}`} = DISTINCTCOUNT(${T}[${C}])`,
      explanation: `**DISTINCTCOUNT** počítá unikátní (různé) hodnoty sloupce [${C}].`,
    }),
  },
  {
    id: 'sameperiodlastyear',
    keys: ['minulý rok', 'loňský rok', 'loňský', 'meziročně', 'srovnání s loňskem', 'pytd', 'předchozí rok'],
    generate: (T, C, M) => ({
      name: M || `${C}MinulýRok`,
      code: `${M || `${C}MinulýRok`} =\nCALCULATE(\n    SUM(${T}[${C}]),\n    SAMEPERIODLASTYEAR(Datum[Datum])\n)`,
      explanation: `**SAMEPERIODLASTYEAR** vrací hodnotu za stejné období předchozího roku. Vyžaduje **datumovou tabulku** propojenou s fakty.`,
      warning: 'Vyžaduje datumovou tabulku – viz návod Datumová tabulka.',
    }),
  },
  {
    id: 'ytd',
    keys: ['ytd', 'od začátku roku', 'year to date', 'za rok kumulativně'],
    generate: (T, C, M) => ({
      name: M || `${C}YTD`,
      code: `${M || `${C}YTD`} =\nCALCULATE(\n    SUM(${T}[${C}]),\n    DATESYTD(Datum[Datum])\n)`,
      explanation: `**DATESYTD** filtruje data od 1. 1. do aktuálního data. Každý bod grafu zobrazí součet od začátku roku.`,
    }),
  },
  {
    id: 'mtd',
    keys: ['mtd', 'od začátku měsíce', 'month to date'],
    generate: (T, C, M) => ({
      name: M || `${C}MTD`,
      code: `${M || `${C}MTD`} =\nCALCULATE(\n    SUM(${T}[${C}]),\n    DATESMTD(Datum[Datum])\n)`,
      explanation: `**DATESMTD** filtruje data od 1. dne aktuálního měsíce do dnes.`,
    }),
  },
  {
    id: 'divide',
    keys: ['procento z celku', 'podíl z celku', '% z celku', 'relativní podíl', 'jako procento', 'jako % z'],
    generate: (T, C, M) => ({
      name: M || `${C}Podíl`,
      code: `${M || `${C}Podíl`} =\nDIVIDE(\n    SUM(${T}[${C}]),\n    CALCULATE(SUM(${T}[${C}]), ALL(${T}))\n)`,
      explanation: `**DIVIDE** bezpečně vydělí filtrovanou hodnotu celkovým součtem (ALL odstraní filtry). Formátuj míru jako %.`,
    }),
  },
  {
    id: 'rankx',
    keys: ['pořadí', 'rank', 'žebříček', 'top 10', 'top n', 'seřadit a číslovat'],
    generate: (T, C, M) => ({
      name: M || `Pořadí${C}`,
      code: `${M || `Pořadí${C}`} =\nRANKX(\n    ALL(${T}[Název]),\n    SUM(${T}[${C}]),,\n    DESC, DENSE\n)`,
      explanation: `**RANKX** přiřadí pořadí 1 (největší) až N (nejmenší). DENSE = bez mezer v pořadí (1,2,2,3).`,
    }),
  },
  {
    id: 'running-total',
    keys: ['kumulativní', 'running total', 'průběžný součet', 'narůstající součet'],
    generate: (T, C, M) => ({
      name: M || `${C}Kumulativně`,
      code: `${M || `${C}Kumulativně`} =\nCALCULATE(\n    SUM(${T}[${C}]),\n    FILTER(\n        ALL(Datum[Datum]),\n        Datum[Datum] <= MAX(Datum[Datum])\n    )\n)`,
      explanation: `Kumulativní součet – každý bod grafu = součet všech hodnot od začátku do tohoto data.`,
    }),
  },
  {
    id: 'calculate-filter',
    keys: ['jen pro kategorii', 'pouze pro', 'filtrovaný výpočet', 'podmíněný součet', 'calculate'],
    generate: (T, C, M) => ({
      name: M || `${C}Filtrovaně`,
      code: `${M || `${C}Filtrovaně`} =\nCALCULATE(\n    SUM(${T}[${C}]),\n    ${T}[Kategorie] = "SváHodnota"\n)`,
      explanation: `**CALCULATE** přepíše kontext filtru. Nahraď \`${T}[Kategorie] = "SváHodnota"\` svou podmínkou.`,
    }),
  },
  {
    id: 'if-condition',
    keys: ['pokud', 'podmíněný výpočet', 'kdyby', 'když', 'IF funkce'],
    generate: (T, C, M) => ({
      name: M || `${C}Podmíněně`,
      code: `${M || `${C}Podmíněně`} =\nIF(\n    SUM(${T}[${C}]) > 100000,\n    "Vysoké",\n    "Nízké"\n)`,
      explanation: `**IF** vrátí různé hodnoty podle podmínky. Pro více větví použij SWITCH() místo vnořených IF.`,
    }),
  },
];

// ─── Tutorial linker ──────────────────────────────────────────────────────────

const TUTORIAL_LINKS = [
  { id: 'sloupcovy-graf',            keys: ['sloupcový', 'pruhový', 'seskupený', 'bar chart'],            label: 'Sloupcový graf' },
  { id: 'spojnicovy-graf',           keys: ['spojnicový', 'trend', 'liniový', 'vývoj v čase'],            label: 'Spojnicový graf' },
  { id: 'vysecovy-prstencovy-graf',  keys: ['koláčový', 'prstencový', 'výsečový', 'donut'],               label: 'Výsečový / Prstencový' },
  { id: 'rozptylovy-graf',           keys: ['scatter', 'bodový', 'bublinový', 'korelace'],                label: 'Rozptylový / Bublinový' },
  { id: 'treemap-vizual',            keys: ['treemap', 'stromový', 'hierarchie vizuál'],                  label: 'Treemap' },
  { id: 'vodopady-graf',             keys: ['vodopád', 'waterfall', 'bridge chart'],                      label: 'Vodopádový graf' },
  { id: 'matice-vizual',             keys: ['matice', 'pivot tabulka', 'matrix'],                         label: 'Matice (Pivot)' },
  { id: 'kpi-karta-dax',             keys: ['kpi', 'karta', 'sparkline', 'indikátor'],                    label: 'KPI karta s DAX' },
  { id: 'calculate-funkce',          keys: ['calculate', 'filtrovaný výpočet', 'kontext'],                label: 'Funkce CALCULATE' },
  { id: 'datumova-tabulka',          keys: ['datumová tabulka', 'calendar', 'ytd', 'sameperiodlastyear'], label: 'Datumová tabulka' },
  { id: 'propojeni-tabulek',         keys: ['relace', 'propojit tabulky', 'klíč', 'foreign key'],         label: 'Propojení tabulek' },
  { id: 'podminsene-formatovani',    keys: ['podmíněné formátování', 'tepelná mapa', 'barvy buněk'],      label: 'Podmíněné formátování' },
  { id: 'drillthrough',              keys: ['drillthrough', 'detail stránka', 'přejít na'],               label: 'Drillthrough' },
  { id: 'selectedvalue-prurezy',     keys: ['selectedvalue', 'dynamický titulek', 'průřez', 'přepínání'], label: 'SELECTEDVALUE a průřezy' },
  { id: 'rankx-zebricek',            keys: ['rankx', 'žebříček', 'pořadí produkt', 'top 10'],             label: 'RANKX – žebříček' },
  { id: 'ytd-vypocet',               keys: ['ytd výpočet', 'od začátku roku', 'datesytd'],                label: 'YTD výpočet' },
  { id: 'kumulativni-soucet',        keys: ['kumulativní', 'running total', 'průběžný'],                  label: 'Kumulativní součet' },
  { id: 'pruvodce-co-kam',           keys: ['co dát kam', 'nastavení grafu', 'pole grafu'],               label: 'Průvodce: Co dát kam v grafu' },
  { id: 'dax-miry-v-grafech',        keys: ['míra v grafu', 'dax v grafu', 'propojení výpočtu'],          label: 'DAX míry v grafech' },
];

// ─── Entity extraction ─────────────────────────────────────────────────────────

function extractEntities(lower) {
  let T = 'Objednávky';
  if (lower.includes('zákazník')) T = 'Zákazníci';
  else if (lower.includes('zaměstnanec') || lower.includes('zaměstnanci')) T = 'Zaměstnanci';
  else if (lower.includes('produkt') || lower.includes('zboží')) T = 'Produkty';
  else if (lower.includes('financ') || lower.includes('náklad') || lower.includes('výdaj')) T = 'Finance';

  let C = 'Tržba';
  if (lower.includes('cen') && !lower.includes('stránce') && !lower.includes('cení')) C = 'Cena';
  else if (lower.includes('zisk') || lower.includes('marž')) C = 'Zisk';
  else if (lower.includes('množstv')) C = 'Množství';
  else if (lower.includes('náklad')) C = 'Náklady';
  else if (lower.includes('plat')) C = 'Plat';

  let DIM = null;
  if (lower.includes('region') || lower.includes('kraj') || lower.includes('lokac')) DIM = 'Region';
  else if (lower.includes('kategori')) DIM = 'Kategorie';
  else if (lower.includes('odděl')) DIM = 'Oddělení';
  else if (lower.includes('pohlaví') || lower.includes('muž') || lower.includes('žen')) DIM = 'Pohlaví';
  else if (lower.includes('produkt') && T !== 'Produkty') DIM = 'Produkt';
  else if (lower.includes('segment')) DIM = 'Segment';

  return { T, C, DIM };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function score(lower, keys) {
  return keys.reduce((s, k) => lower.includes(k) ? s + k.split(' ').length : s, 0);
}

// ─── Main analysis ─────────────────────────────────────────────────────────────

function analyzeQuery(text) {
  const lower = text.toLowerCase();
  const entities = extractEntities(lower);

  // Chart matching
  const chartScores = CHART_RULES
    .map(r => ({ ...r, sc: score(lower, r.keys) }))
    .sort((a, b) => b.sc - a.sc);
  const topChart = chartScores[0].sc > 0 ? chartScores[0] : null;
  const altCharts = chartScores.filter(c => c.sc > 0 && c.id !== topChart?.id).slice(0, 2);

  // DAX matching
  const daxMatches = DAX_RULES.filter(r => score(lower, r.keys) > 0).slice(0, 3);

  // Tutorial matching
  const tutorials = TUTORIAL_LINKS.filter(t => score(lower, t.keys) > 0).slice(0, 5);

  // Auto-add time tutorial if time DAX detected
  const hasTimeDax = daxMatches.some(d => ['sameperiodlastyear', 'ytd', 'mtd', 'running-total'].includes(d.id));
  if (hasTimeDax && !tutorials.find(t => t.id === 'datumova-tabulka')) {
    tutorials.unshift({ id: 'datumova-tabulka', label: 'Datumová tabulka (potřebná pro časové výpočty)' });
  }
  // Auto-add chart tutorial
  if (topChart && !tutorials.find(t => t.id === topChart.tutorialId)) {
    tutorials.unshift({ id: topChart.tutorialId, label: `Podrobný návod: ${topChart.name}` });
  }

  // Generate DAX code
  const daxCodes = daxMatches.map(r => r.generate(entities.T, entities.C, null));

  // Build setup steps
  const setupSteps = topChart ? topChart.setupSteps(entities) : null;
  const fieldMap = topChart ? topChart.fieldMap(entities) : null;

  return {
    topChart, altCharts, daxMatches, daxCodes,
    tutorials: tutorials.slice(0, 4),
    setupSteps, fieldMap, entities,
    hasResult: !!(topChart || daxMatches.length),
  };
}

// ─── Quick examples ────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Vývoj tržeb zákazníků po měsících a porovnání s loňským rokem',
  'Koláčový graf s procentem – podíl kategorií na celkových tržbách',
  'Žebříček TOP 10 produktů podle tržeb – sloupcový graf',
  'YTD tržby od začátku roku v kartě a porovnání s cílem',
  'Matice tržeb podle kategorie produktů a roku',
  'Kumulativní součet tržeb v čase – jak plníme roční cíl',
  'Bodový graf – korelace průměrné ceny a počtu objednávek zákazníků',
  'Složení zaměstnanců podle pohlaví v každém oddělení',
  'Vodopádový bridge chart – jak jsme se dostali od tržeb k zisku',
];

// ─── Color helper ─────────────────────────────────────────────────────────────

const COLORS = {
  blue:   { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   ring: 'border-blue-500/30' },
  green:  { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', ring: 'border-emerald-500/30' },
  orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', ring: 'border-orange-500/30' },
  purple: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', ring: 'border-purple-500/30' },
  teal:   { badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',   ring: 'border-teal-500/30' },
  yellow: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', ring: 'border-yellow-500/30' },
  gray:   { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',   ring: 'border-gray-500/20' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartAssistant() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(analyzeQuery(input));
      setLoading(false);
    }, 300);
  };

  const loadExample = (ex) => {
    setInput(ex);
    setResult(null);
    setTimeout(() => {
      setResult(analyzeQuery(ex));
    }, 150);
  };

  const col = result?.topChart ? (COLORS[result.topChart.color] || COLORS.blue) : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Brain size={22} className="text-purple-400" />
          Chytrý asistent
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Napiš co chceš udělat – dostaneš doporučení vizuálu, DAX kód a krok za krokem průvodce
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: input + results ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Input card */}
          <div className="card p-6">
            <form onSubmit={analyze} className="space-y-4">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze(); }}
                placeholder="Např. Chci zobrazit vývoj tržeb zákazníků po měsících a porovnat s loňským rokem…"
                className="textarea h-28 resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Sparkles size={15} /> Analyzovat</>
                  }
                </button>
                {result && (
                  <button
                    type="button"
                    onClick={() => { setInput(''); setResult(null); }}
                    className="btn-ghost text-sm text-gray-600"
                  >
                    Smazat
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-600">Ctrl+Enter · Vše se zpracuje lokálně, žádná data se nikam neodesílají</p>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-fade-in">

              {/* No match */}
              {!result.hasResult && (
                <div className="card p-6 border border-white/8">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={16} className="text-yellow-400" />
                    <p className="font-medium text-gray-200">Zkus být konkrétnější</p>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Nepodařilo se rozpoznat konkrétní potřebu. Přidej klíčová slova jako:
                    <span className="text-gray-200"> tržby, vývoj, porovnat, součet, průměr, podíl, trend, minulý rok, YTD, žebříček, korelace…</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXAMPLES.slice(0, 4).map((ex, i) => (
                      <button key={i} onClick={() => loadExample(ex)} className="text-left p-3 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 transition-all">
                        <p className="text-xs text-gray-300 leading-snug">{ex}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chart recommendation */}
              {result.topChart && col && (
                <div className={`card p-5 border ${col.ring}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl leading-none">{result.topChart.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-100">Doporučuji: {result.topChart.name}</h3>
                        {result.altCharts.length > 0 && (
                          <span className="text-xs text-gray-500">
                            (nebo: {result.altCharts.map(c => c.icon + ' ' + c.name).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/tutorials/${result.topChart.tutorialId}`} className="btn-ghost text-xs gap-1 flex-shrink-0">
                      <BookOpen size={12} /> Návod
                    </Link>
                  </div>

                  {/* Field mapping */}
                  {result.fieldMap && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Co přetáhnout kam</p>
                      <div className="space-y-1.5">
                        {result.fieldMap.map((f, i) => (
                          <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${col.badge}`}>
                              {f.role}
                            </span>
                            <code className="text-xs text-gray-200 font-mono break-all">{f.val}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  {result.setupSteps && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Krok za krokem</p>
                      <div className="space-y-1.5">
                        {result.setupSteps.map((step, i) => (
                          <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border ${col.badge}`}>
                              {i + 1}
                            </span>
                            <p className="text-xs text-gray-300 leading-snug"
                              dangerouslySetInnerHTML={{ __html: step.replace(/⚠️/g, '<span class="text-yellow-400">⚠️</span>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DAX codes */}
              {result.daxCodes.length > 0 && (
                <div className="card p-5 border border-purple-500/20 space-y-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <h3 className="font-semibold text-gray-100">
                      {result.daxCodes.length === 1 ? 'DAX míra' : `${result.daxCodes.length} DAX míry`}
                    </h3>
                  </div>

                  {result.daxCodes.map((c, i) => (
                    <div key={i} className="space-y-2">
                      <CodeBlock code={c.code} language="dax" title={c.name} />
                      <p className="text-xs text-gray-400 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: c.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                      />
                      {c.warning && (
                        <div className="flex gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                          <span className="text-yellow-400 text-xs">⚠️</span>
                          <p className="text-xs text-yellow-300/80">{c.warning}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* How to add measure */}
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Jak míru přidat</p>
                    {['Klikni pravým na tabulku v záložce **Pole** → Nová míra',
                      'Zkopíruj kód výše do řádku vzorců a stiskni Enter',
                      'Nastav **formát** (Kč, %, ks) v záložce Nástroje měření',
                      'Přetáhni míru do grafu nebo karty'].map((s, i) => (
                      <div key={i} className="flex gap-3 p-2 rounded-lg bg-white/3 border border-white/5 mb-1.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-purple-500/10 text-purple-400 border border-purple-500/20">{i + 1}</span>
                        <p className="text-xs text-gray-300 leading-snug"
                          dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>') }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant tutorials */}
              {result.tutorials.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} className="text-brand-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Relevantní návody</h3>
                  </div>
                  <div className="space-y-1.5">
                    {result.tutorials.map((t, i) => (
                      <Link
                        key={i}
                        to={`/tutorials/${t.id}`}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 hover:border-brand-500/20 transition-all group"
                      >
                        <CheckCircle2 size={12} className="text-brand-400 flex-shrink-0" />
                        <span className="text-xs text-gray-300 group-hover:text-white flex-1">{t.label}</span>
                        <ChevronRight size={11} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: examples + info ── */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-yellow-400" /> Příklady dotazů
            </h3>
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all group ${
                    input === ex
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
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
              <Brain size={14} className="text-purple-400" /> Co asistent umí
            </h3>
            <div className="space-y-1.5 text-xs text-gray-400">
              {[
                ['📊', 'Doporučí vizuál a nastavení polí'],
                ['✨', 'Vygeneruje DAX kód (SUM, YTD, RANKX…)'],
                ['📋', 'Krok za krokem průvodce nastavením'],
                ['📚', 'Odkáže na relevantní návody'],
                ['🔗', 'Rozpozná více potřeb v jedné větě'],
                ['🔒', 'Offline – žádné API, žádné náklady'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
