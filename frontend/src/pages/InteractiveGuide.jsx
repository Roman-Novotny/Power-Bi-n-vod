import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, ChevronRight, ArrowLeft, Check, Wand2, Lightbulb, ExternalLink } from 'lucide-react';
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
      { value: 'calculate',     label: 'Vypočítat hodnotu (DAX)',         icon: '✨', next: 'calc_type' },
      { value: 'transform',     label: 'Transformovat data (M Query)',     icon: '🔧', next: 'mq_op' },
      { value: 'filter',        label: 'Filtrovat data',                   icon: '🔍', next: 'filter_type' },
      { value: 'time',          label: 'Časová analýza (YTD, MoM…)',      icon: '⏱️', next: 'time_type' },
      { value: 'chart',         label: 'Vytvořit / nastavit graf',         icon: '📊', next: 'chart_goal' },
      { value: 'visual',        label: 'Tipy pro report / dashboard',      icon: '🎨', next: 'visual_type' },
      { value: 'relationship',  label: 'Propojit tabulky / datový model',  icon: '🔗', next: 'model_type' },
    ],
  },

  // ── DAX calc path ─────────────────────────────────────────────────────────
  {
    id: 'calc_type',
    question: 'Jaký typ výpočtu chceš?',
    type: 'choice',
    choices: [
      { value: 'součet',    label: 'Součet (SUM)',           icon: '➕', next: 'inputs_dax' },
      { value: 'průměr',    label: 'Průměr (AVERAGE)',       icon: '📊', next: 'inputs_dax' },
      { value: 'počet',     label: 'Počet (COUNT)',          icon: '🔢', next: 'inputs_dax' },
      { value: 'unikátní',  label: 'Unikátní hodnoty',       icon: '🎯', next: 'inputs_dax' },
      { value: 'procento',  label: 'Procento z celku',       icon: '💯', next: 'inputs_dax' },
      { value: 'podmínka',  label: 'Podmíněný výpočet (IF)', icon: '❓', next: 'inputs_dax' },
      { value: 'rankx',     label: 'Žebříček / pořadí (RANKX)', icon: '🏆', next: 'inputs_dax' },
      { value: 'divide',    label: 'Bezpečné dělení (DIVIDE)', icon: '➗', next: 'inputs_dax' },
    ],
  },

  // ── Time path ─────────────────────────────────────────────────────────────
  {
    id: 'time_type',
    question: 'Jakou časovou metriku chceš?',
    type: 'choice',
    choices: [
      { value: 'ytd',              label: 'YTD – od začátku roku',          icon: '📅', next: 'inputs_dax' },
      { value: 'mtd',              label: 'MTD – od začátku měsíce',        icon: '📆', next: 'inputs_dax' },
      { value: 'předchozí rok',    label: 'Minulý rok (PYTD)',               icon: '⏪', next: 'inputs_dax' },
      { value: 'průběžný součet',  label: 'Kumulativní (Running Total)',     icon: '📈', next: 'inputs_dax' },
      { value: 'mtd',              label: 'Porovnání s minulým měsícem',     icon: '↔️', next: 'inputs_dax' },
    ],
  },

  // ── Filter path ───────────────────────────────────────────────────────────
  {
    id: 'filter_type',
    question: 'Jak chceš filtrovat?',
    type: 'choice',
    choices: [
      { value: 'calculate',       label: 'Filtrovaný výpočet (CALCULATE)',  icon: '🎛️', next: 'inputs_dax' },
      { value: 'filter-equals',   label: 'Filtr rovná se (M Query)',        icon: '=',  next: 'inputs_mq' },
      { value: 'filter-contains', label: 'Filtr obsahuje text',             icon: '🔤', next: 'inputs_mq' },
      { value: 'filter-not-null', label: 'Odstraň prázdné hodnoty',         icon: '🚫', next: 'inputs_mq' },
      { value: 'filter-greater',  label: 'Filtr větší než hodnota',         icon: '>', next: 'inputs_mq' },
    ],
  },

  // ── M Query path ──────────────────────────────────────────────────────────
  {
    id: 'mq_op',
    question: 'Jakou transformaci chceš provést?',
    type: 'choice',
    choices: [
      { value: 'change-type-number', label: 'Změna datového typu na číslo',  icon: '🔢', next: 'inputs_mq' },
      { value: 'change-type-date',   label: 'Změna datového typu na datum',  icon: '📅', next: 'inputs_mq' },
      { value: 'remove-column',      label: 'Odstraň sloupec',               icon: '🗑️', next: 'inputs_mq' },
      { value: 'remove-duplicates',  label: 'Odstraň duplicity',             icon: '♻️', next: 'inputs_mq' },
      { value: 'group-by',           label: 'Seskup a agreguj',              icon: '📋', next: 'inputs_mq' },
      { value: 'fill-down',          label: 'Vyplň dolů (Fill Down)',        icon: '⬇️', next: 'inputs_mq' },
      { value: 'split-column',       label: 'Rozděl sloupec',                icon: '✂️', next: 'inputs_mq' },
      { value: 'unpivot',            label: 'Zruš kontingenční tabulku (Unpivot)', icon: '🔄', next: 'inputs_mq' },
    ],
  },

  // ── Chart path ────────────────────────────────────────────────────────────
  {
    id: 'chart_goal',
    question: 'Co chceš grafem zobrazit?',
    type: 'choice',
    choices: [
      { value: 'trend',       label: 'Vývoj v čase (trend)',                   icon: '📈', next: 'result_chart_line' },
      { value: 'comparison',  label: 'Porovnání kategorií',                    icon: '📊', next: 'result_chart_bar' },
      { value: 'proportion',  label: 'Podíl / struktura z celku',              icon: '🥧', next: 'result_chart_pie' },
      { value: 'correlation', label: 'Vztah mezi dvěma metrikami',             icon: '⚬', next: 'result_chart_scatter' },
      { value: 'hierarchy',   label: 'Hierarchická data (kategorie → detail)', icon: '🟩', next: 'result_chart_treemap' },
      { value: 'kpi',         label: 'Jedno klíčové číslo (KPI karta)',        icon: '🎯', next: 'result_chart_kpi' },
      { value: 'waterfall',   label: 'Přírůstky a úbytky (Bridge chart)',      icon: '📉', next: 'result_chart_waterfall' },
    ],
  },

  // ── Visual/report path ────────────────────────────────────────────────────
  {
    id: 'visual_type',
    question: 'S čím potřebuješ pomoct na reportu?',
    type: 'choice',
    choices: [
      { value: 'cond-format',  label: 'Podmíněné formátování (barvy, ikony)', icon: '🎨', next: 'result_info_cond' },
      { value: 'drillthrough', label: 'Drillthrough – přechod na detail',     icon: '🔍', next: 'result_info_drill' },
      { value: 'cross-filter', label: 'Křížové filtrování vizuálů',           icon: '🔗', next: 'result_info_cross' },
      { value: 'dyn-title',    label: 'Dynamický titulek grafu',              icon: '✏️', next: 'result_info_title' },
      { value: 'bookmarks',    label: 'Záložky a tlačítka (přepínání pohledů)', icon: '📌', next: 'result_info_bookmarks' },
      { value: 'sparkline',    label: 'Sparkline (miniaturní graf v kartě)',   icon: '📉', next: 'result_info_sparkline' },
    ],
  },

  // ── Model path ────────────────────────────────────────────────────────────
  {
    id: 'model_type',
    question: 'Jaký problém v datovém modelu řešíš?',
    type: 'choice',
    choices: [
      { value: 'propojeni',    label: 'Jak propojit tabulky relací',          icon: '🔗', next: 'result_info_relace' },
      { value: 'kardinalita',  label: 'Kardinalita a směr filtru',            icon: '↔️', next: 'result_info_kardinalita' },
      { value: 'hvezdne-schema', label: 'Hvězdné schéma (Star Schema)',       icon: '⭐', next: 'result_info_star' },
      { value: 'datumova',     label: 'Vytvoření datumové tabulky',           icon: '📅', next: 'result_info_datum' },
    ],
  },

  // ── DAX / MQ inputs ───────────────────────────────────────────────────────
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

  // ── Chart result steps (info) ─────────────────────────────────────────────
  {
    id: 'result_chart_line',
    question: '📈 Doporučení: Spojnicový graf',
    type: 'info',
    content: {
      text: `**Spojnicový graf** je ideální pro sledování trendů v čase.\n\n**Jak ho nastavit:**\n1. Přidej vizuál **Spojnicový graf** z panelu Vizualizace\n2. **Osa X** → pole z datumové tabulky (Datum[MěsícNázev])\n3. **Osa Y** → tvoje míra: SUM(Tabulka[Hodnota])\n4. **Legenda** → kategorie pro více linií (volitelné)\n\n**Vylepšení v záložce Analýza:** přidej klouzavý průměr, referenční čáru (cíl) nebo pásmo předpovědi.`,
      tip: 'Vždy používej dedikovanou datumovou tabulku – bez ní funkce YTD, MTD a SAMEPERIODLASTYEAR nebudou fungovat.',
      tutorialLink: '/tutorials/spojnicovy-graf',
      tutorialLabel: 'Podrobný návod: Spojnicový graf',
    },
  },
  {
    id: 'result_chart_bar',
    question: '📊 Doporučení: Sloupcový / Pruhový graf',
    type: 'info',
    content: {
      text: `**Seskupený sloupcový graf** je nejuniverzálnější vizuál v Power BI.\n\n**Jak ho nastavit:**\n1. Přidej **Sloupcový seskupený** z panelu Vizualizace\n2. **Osa X** → kategorie (Produkty[Název], Region[Kraj])\n3. **Osa Y** → míra (SUM(Objednávky[Tržba]))\n4. **Legenda** → druhá dimenze pro seskupení (volitelné)\n\n**Tipy:**\n- Seřaď: "..." → Seřadit podle → vyber míru (sestupně)\n- TOP N: filtr vizuálu → Typ filtru: Top N\n- Pruhový (vodorovný) = lepší pro dlouhé názvy kategorií`,
      tip: 'Pro žebříček přidej míru RANKX a seřaď vizuál sestupně.',
      tutorialLink: '/tutorials/sloupcovy-graf',
      tutorialLabel: 'Podrobný návod: Sloupcový graf',
    },
  },
  {
    id: 'result_chart_pie',
    question: '🥧 Doporučení: Koláčový / Prstencový graf',
    type: 'info',
    content: {
      text: `**Koláčový / Prstencový graf** zobrazuje podíl kategorií na celku.\n\n**Jak ho nastavit:**\n1. Přidej **Koláčový** nebo **Prstencový** graf\n2. **Legenda** → kategorie (co tvoří výseče)\n3. **Hodnoty** → míra (SUM(Objednávky[Tržba]))\n4. Záložka Formát → Datové popisky → zapni % z celku\n\n**Upozornění:** Používej **max. 5–6 kategorií** – více = nečitelný graf. Pro více kategorií preferuj sloupcový graf nebo treemap.`,
      tip: 'Prstencový (donut) je modernější – do středu grafu lze přidat celkovou hodnotu pomocí vlastního textu.',
      tutorialLink: '/tutorials/vysecovy-prstencovy-graf',
      tutorialLabel: 'Podrobný návod: Výsečový / Prstencový graf',
    },
  },
  {
    id: 'result_chart_scatter',
    question: '⚬ Doporučení: Bodový / Bublinový graf',
    type: 'info',
    content: {
      text: `**Bodový (Scatter) / Bublinový graf** odhaluje korelace mezi dvěma metrikami.\n\n**Jak ho nastavit:**\n1. Přidej **Bodový graf** z panelu Vizualizace\n2. **Osa X** → první metrika (průměrná cena, počet objednávek)\n3. **Osa Y** → druhá metrika (celkové tržby, ziskovost)\n4. **Hodnoty / Detail** → co každý bod představuje (Zákazníci[Název])\n5. **Velikost** → třetí metrika = velikost bubliny (volitelné)\n\n**Záložka Analýza:** přidej trend linii pro zobrazení lineární regrese.`,
      tip: 'Obě osy musí být míry (ne kategorie). Přidej Play Axis (Datum[Rok]) pro animaci vývoje v čase.',
      tutorialLink: '/tutorials/rozptylovy-graf',
      tutorialLabel: 'Podrobný návod: Rozptylový / Bublinový graf',
    },
  },
  {
    id: 'result_chart_treemap',
    question: '🟩 Doporučení: Treemap (Stromový graf)',
    type: 'info',
    content: {
      text: `**Treemap** zobrazuje hierarchická data jako vnořené obdélníky – velikost = metrika.\n\n**Jak ho nastavit:**\n1. Přidej **Treemap** z panelu Vizualizace\n2. **Skupina** → hlavní kategorie (Produkty[Kategorie])\n3. **Podrobnosti** → podkategorie pro drilldown (Produkty[Název])\n4. **Hodnoty** → metrika určující velikost (SUM(Tržba))\n5. Kliknutím na obdélník provedeš drilldown\n\n**Barva jako třetí dimenze:** v záložce Formát → Barvy dat nastav podmíněné formátování (např. marže).`,
      tip: 'Ctrl+klik na více bloků = multi-select pro filtrování zbytku reportu.',
      tutorialLink: '/tutorials/treemap-vizual',
      tutorialLabel: 'Podrobný návod: Treemap',
    },
  },
  {
    id: 'result_chart_kpi',
    question: '🎯 Doporučení: KPI Karta',
    type: 'info',
    content: {
      text: `**KPI Karta** zobrazuje jedno prominentní číslo – základní prvek každého dashboardu.\n\n**Jak ho nastavit:**\n1. Přidej vizuál **Karta** nebo **KPI**\n2. **Karta:** vlož jednu míru (SUM(Tržba), COUNTROWS(...))\n3. **KPI:** přidej Hodnotu, Cíl (Target) a Trend (datumová osa)\n4. Nastav formát míry (Kč, %, ks) v záložce Nástroje měření\n\n**Nový vizuál Karta (2024+):** podporuje více hodnot, podmíněné formátování a sparkline v jedné kartě!`,
      tip: 'Přidej porovnání s minulým rokem: TržbyMinulýRok = CALCULATE([Tržby], SAMEPERIODLASTYEAR(Datum[Datum]))',
      tutorialLink: '/tutorials/kpi-karta-dax',
      tutorialLabel: 'Podrobný návod: KPI karta s DAX',
    },
  },
  {
    id: 'result_chart_waterfall',
    question: '📉 Doporučení: Vodopádový graf (Waterfall)',
    type: 'info',
    content: {
      text: `**Vodopádový graf** zobrazuje přírůstky a úbytky vedoucí k výsledku – klasický Bridge chart.\n\n**Jak ho nastavit:**\n1. Přidej **Vodopádový graf** z panelu Vizualizace\n2. **Kategorie** → kroky (Datum[MěsícNázev], Finance[Faktor])\n3. **Hodnoty Y** → míra zobrazující ZMĚNU (ne absolutní hodnotu!)\n4. Klikni pravým na první/poslední sloupec → **Nastavit jako celkový** (Total)\n\n**Barvy jsou automatické:** zelená = přírůstek, červená = úbytek, šedá = celkový.`,
      tip: 'Vodopád nefunguje s více než 10–12 kroky – zvažuj agregaci (čtvrtletí místo měsíců).',
      tutorialLink: '/tutorials/vodopady-graf',
      tutorialLabel: 'Podrobný návod: Vodopádový graf',
    },
  },

  // ── Visual tips result steps ───────────────────────────────────────────────
  {
    id: 'result_info_cond',
    question: '🎨 Podmíněné formátování',
    type: 'info',
    content: {
      text: `**Podmíněné formátování** mění barvy, ikony nebo datové pruhy podle hodnoty – bez kódu.\n\n**Jak ho nastavit:**\n1. Klikni na vizuál (tabulka, matice, karta)\n2. Záložka Formát → u číselného pole klikni na **fx** ikonu\n3. Typ: **Barevná škála** (automatický gradient), **Pravidla** (vlastní podmínky) nebo **Hodnota pole** (DAX barva)\n\n**Tepelná mapa v matici:** záložka Hodnoty → ikona fx → Barva pozadí → Barevná škála.\n**Ikony/šipky:** záložka Formát → Ikony → fx → nastav pravidla (< 0 = červená šipka dolů)`,
      tip: 'DAX míra pro barvu: BarvaVýkonu = IF([Odchylka%] >= 0, "#16A34A", "#DC2626") – pak vyber "Hodnota pole".',
      tutorialLink: '/tutorials/podminsene-formatovani',
      tutorialLabel: 'Podrobný návod: Podmíněné formátování',
    },
  },
  {
    id: 'result_info_drill',
    question: '🔍 Drillthrough – přechod na detailní stránku',
    type: 'info',
    content: {
      text: `**Drillthrough** umožní kliknout pravým na datový bod a přejít na detailní stránku.\n\n**Jak ho nastavit:**\n1. Vytvoř novou stránku pro detail (např. "Detail zákazníka")\n2. Na detailní stránce → záložka Sestavení → **Drillthrough** → přidej pole (Zákazníci[ZákazníkID])\n3. Na zdrojové stránce klikni pravým na datový bod → **Přejít → Detail zákazníka**\n\nStránka detailu se automaticky filtruje na vybraný záznam. Power BI přidá tlačítko **Zpět** automaticky.`,
      tip: 'Nastav "Zachovat všechny filtry" v nastavení drillthrough – uživatel uvidí detail v kontextu všech aktivních filtrů.',
      tutorialLink: '/tutorials/drillthrough',
      tutorialLabel: 'Podrobný návod: Drillthrough',
    },
  },
  {
    id: 'result_info_cross',
    question: '🔗 Křížové filtrování vizuálů',
    type: 'info',
    content: {
      text: `**Křížové filtrování** je automaticky zapnuto – kliknutí na vizuál filtruje ostatní na stránce.\n\n**Jak ho ovládat:**\n1. Záložka Formát → klikni na **Úpravy interakcí** (ikona v horní liště)\n2. Klikni na zdrojový vizuál, poté u každého cílového vizuálu nastav:\n   - 🔽 Filtrovat (trychtýř) – filtruje\n   - 📊 Zvýraznit (histogram) – zvýrazní, nezafiltruje\n   - ⊘ Vypnuto – ignoruje\n3. Průřezy filtrují celou stránku – nastavení je globální\n\n**Synchronizace průřezů přes více stránek:** záložka Zobrazit → Synchronizovat průřezy.`,
      tip: 'Pokud nechceš, aby kliknutí na mapu filtrovalo tabulku, nastav interakci na "Vypnuto".',
      tutorialLink: '/tutorials/krizove-filtrovani',
      tutorialLabel: 'Podrobný návod: Křížové filtrování',
    },
  },
  {
    id: 'result_info_title',
    question: '✏️ Dynamický titulek grafu',
    type: 'info',
    content: {
      text: `**Dynamický titulek** se automaticky mění podle výběru v průřezu.\n\n**Jak ho nastavit:**\n1. Vytvoř DAX míru:\n   TitulekGrafu = "Tržby za " & SELECTEDVALUE(Datum[Rok], "všechny roky")\n2. Klikni na vizuál → záložka Formát → Obecné → Titulek\n3. U pole "Text" klikni na **fx** ikonu\n4. Typ formátování: Hodnota pole → vyber míru TitulekGrafu\n\nSejný postup funguje pro **Podnadpis, Popis osy, Poznámka** pod vizuálem.`,
      tip: 'Kombinuj více SELECTEDVALUE: "Tržby " & SELECTEDVALUE(Datum[Rok]) & " | " & SELECTEDVALUE(Region[Kraj], "vše")',
      tutorialLink: '/tutorials/selectedvalue-prurezy',
      tutorialLabel: 'Návod: SELECTEDVALUE a průřezy',
    },
  },
  {
    id: 'result_info_bookmarks',
    question: '📌 Záložky a tlačítka',
    type: 'info',
    content: {
      text: `**Záložky (Bookmarks)** ukládají stav stránky – filtry, viditelné vizuály, výběry. Tlačítka je aktivují.\n\n**Jak je nastavit:**\n1. Nastav report do požadovaného stavu (filtry, průřezy)\n2. Záložka Zobrazit → **Záložky** → Přidat záložku\n3. Přidej tlačítko: záložka Vloži → Tlačítko nebo Tvarový prvek\n4. Klikni na tlačítko → záložka Formát → Akce → Záložka → vyber uloženou záložku\n\n**Přepínání pohledů:** vytvoř záložky "Graf" a "Tabulka" + 2 překrývající se vizuály – záložky přepínají viditelnost.`,
      tip: 'Zaškrtni "Pouze dat" v záložce pro ignorování vybraných prvků – pak záložka ovlivňuje jen data, ne vizuální výběr.',
      tutorialLink: '/tutorials/tlacitka-zalohy',
      tutorialLabel: 'Podrobný návod: Záložky a tlačítka',
    },
  },
  {
    id: 'result_info_sparkline',
    question: '📉 Sparkline – miniaturní graf v kartě/tabulce',
    type: 'info',
    content: {
      text: `**Sparkline** je miniaturní graf zobrazený přímo v buňce tabulky nebo karty – zobrazuje trend bez samostatného grafu.\n\n**Jak ho přidat:**\n1. Klikni na vizuál **Tabulka** nebo **Karta (nová)**\n2. V panelu Vizualizace klikni na šipku ▼ vedle míry\n3. Vyber **Přidat sparkline**\n4. Nastav: Osa = Datum[MěsícNázev], Typ = Linie nebo Sloupec\n\n**V matici:** klikni pravým na záhlaví sloupce → Přidat sparkline`,
      tip: 'Sparkline v matici zobrazí trend pro každý řádek – skvělé pro přehled výkonu každého produktu/zákazníka.',
      tutorialLink: '/tutorials/kpi-karta-dax',
      tutorialLabel: 'Návod: KPI karta se sparkline',
    },
  },

  // ── Model result steps ─────────────────────────────────────────────────────
  {
    id: 'result_info_relace',
    question: 'Jak propojit tabulky',
    type: 'info',
    content: {
      text: `**Propojení tabulek relací** v Power BI:\n1. Přejdi do zobrazení **Model** (vlevo)\n2. Přetáhni klíčový sloupec z jedné tabulky na odpovídající v druhé\n3. Power BI vytvoří relaci automaticky\n4. Dvakrát klikni na čáru pro nastavení kardinality (1:N, 1:1) a směru filtru`,
      tip: 'Nejčastější relace je 1:N – jeden zákazník, mnoho objednávek. Sloupce musí mít stejný datový typ!',
      tutorialLink: '/tutorials/propojeni-tabulek',
      tutorialLabel: 'Podrobný návod: Propojení tabulek',
    },
  },
  {
    id: 'result_info_kardinalita',
    question: 'Kardinalita a směr filtru',
    type: 'info',
    content: {
      text: `**Kardinalita** popisuje vztah počtu hodnot mezi propojenými tabulkami:\n\n- **1:N** (Jeden k mnoha) – nejčastější, bezpečné. Zákazník → Objednávky.\n- **1:1** (Jeden k jednomu) – méně časté, obě tabulky sdílejí klíč.\n- **N:N** (Mnoho k mnoha) – vyžaduje překlenovací tabulku nebo opatrnost.\n\n**Směr filtru:**\n- **Jednosměrný** (→) – filtry tečou jen jedním směrem. Doporučeno.\n- **Obousměrný** (↔) – filtry jdou oběma směry. Může způsobit nejednoznačnosti!`,
      tip: 'Obousměrný filtr používej jen tehdy, kdy je skutečně potřeba. Ve většině modelů stačí jednosměrný.',
      tutorialLink: '/tutorials/relace-typy',
      tutorialLabel: 'Podrobný návod: Typy relací',
    },
  },
  {
    id: 'result_info_star',
    question: '⭐ Hvězdné schéma (Star Schema)',
    type: 'info',
    content: {
      text: `**Hvězdné schéma** je doporučená struktura datového modelu v Power BI:\n\n- **Faktová tabulka** (Fact) uprostřed: obsahuje čísla a klíče (Objednávky, Transakce)\n- **Dimenzionální tabulky** (Dimension) kolem: obsahují atributy (Zákazníci, Produkty, Datum)\n\n**Výhody:**\n- Jednoduché relace (vždy 1:N od dimenze k faktu)\n- Výborný výkon\n- Snadné psaní DAX\n\n**Příklad:** Objednávky ← Zákazníci, Produkty, Datum`,
      tip: 'Nikdy nepropojuj dimenzionální tabulky navzájem. Vše jde přes faktovou tabulku.',
      tutorialLink: '/tutorials/propojeni-tabulek',
      tutorialLabel: 'Podrobný návod: Datový model',
    },
  },
  {
    id: 'result_info_datum',
    question: '📅 Datumová tabulka',
    type: 'info',
    content: {
      text: `**Datumová tabulka** je povinná pro správné fungování časové inteligence (YTD, MTD, atd.).\n\n**Vytvoření pomocí DAX:**\n1. Záložka Modelování → Nová tabulka\n2. Zadej: Datum = CALENDARAUTO()\n3. Přidej sloupce: Rok, Měsíc, Čtvrtletí, MěsícNázev...\n4. Označ jako datumovou tabulku (pravým klikem → Označit)\n5. Propoj Datum[Date] s datumovým sloupcem ve faktových tabulkách`,
      tip: 'CALENDARAUTO() automaticky detekuje nejstarší a nejnovější datum z celého modelu.',
      tutorialLink: '/tutorials/datumova-tabulka',
      tutorialLabel: 'Podrobný návod: Datumová tabulka',
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

  const maxSteps = 4;
  const progress = Math.round(((history.length - 1) / maxSteps) * 100);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Map size={22} className="text-cyan-400" />
          Interaktivní průvodce
        </h1>
        <p className="text-gray-400 text-sm mt-1">Odpovídej na otázky – dostaneš doporučení, kód nebo návod</p>
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
      <div className="flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
        {history.map((id, i) => (
          <span key={id + i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} />}
            <span className={i === history.length - 1 ? 'text-gray-300' : 'text-gray-600'}>
              {getStep(id)?.question?.replace(/^[^\w\s]+\s/, '').slice(0, 28) || id}{i < history.length - 1 ? '…' : ''}
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
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium flex-1">{c.label}</span>
                  <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
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

          {/* Info (guides, chart recommendations, etc.) */}
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
              {currentStep.content.tutorialLink && (
                <Link to={currentStep.content.tutorialLink} className="btn-primary text-sm justify-center">
                  <ExternalLink size={14} />
                  {currentStep.content.tutorialLabel || 'Zobrazit podrobný návod'}
                </Link>
              )}
              {currentStep.content.link && !currentStep.content.tutorialLink && (
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
