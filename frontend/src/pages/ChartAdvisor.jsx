import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Lightbulb, Search, Zap, ChevronRight, Info, BookOpen, Layout } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// ─── Chart rules database ─────────────────────────────────────────────────────

const chartRules = [
  {
    id: 'stacked-column',
    name: 'Skládaný sloupcový graf',
    englishName: 'Stacked Column Chart',
    icon: '📊',
    color: 'blue',
    keys: ['pohlaví','mužů a žen','muži a ženy','gend','dva typy','dvě skupiny','skupiny v','složení v','z čeho se skládá','podíl v každém','složení podle','co tvoří každý'],
    useCase: 'Zobrazuje složení kategorií – kolik z každé podskupiny tvoří každou kategorii. Ideální pro pohlaví, věkové skupiny nebo typy produktů v rámci oddělení.',
    setupSteps: [
      'Přidej vizuál **Sloupcový skládaný** z panelu Vizualizace',
      '**Osa X** → hlavní kategorie (Oddělení[Název])',
      '**Hodnoty Y** → co měříš (COUNTROWS nebo SUM míra)',
      '**Legenda** → co tvoří barevné vrstvy (Zaměstnanci[Pohlaví])',
      'Záložka Formát → Datové popisky → zapni pro přesná čísla',
    ],
    fields: [
      { role: 'Osa X', hint: 'Hlavní kategorie (co srovnáváš)', example: 'Oddělení, Region, Produkt' },
      { role: 'Hodnoty (Y)', hint: 'Co chceš měřit', example: 'COUNTROWS(Tabulka) nebo SUM(...)' },
      { role: 'Legenda', hint: 'Co tvoří barevné vrstvy sloupce', example: 'Pohlaví, Věková skupina, Typ' },
    ],
    daxExample: 'PočetZaměstnanců = COUNTROWS(Zaměstnanci)',
    tips: [
      'Legenda by měla mít max. 5–6 hodnot – jinak jsou barvy nečitelné',
      'Zapni datové popisky pro přesná čísla v každé vrstvě',
      'Zvažuj variantu 100% skládaný pro relativní podíly (ne absolutní hodnoty)',
    ],
    alternatives: ['Seskupený sloupcový (vedle sebe místo nad sebou)', '100% skládaný (relativní podíly v každém sloupci)'],
    tutorialId: 'sloupcovy-graf',
    tutorialLabel: 'Návod: Sloupcový graf',
  },
  {
    id: 'clustered-column',
    name: 'Seskupený sloupcový graf',
    englishName: 'Clustered Column Chart',
    icon: '📊',
    color: 'blue',
    keys: ['srovnání','porovnat','v každém','podle','mezi','ranking','kolik v','nejlepší','nejvíce','nejméně','top','žebříček','pořadí','v jednotlivých','pro každé','vedle sebe','porovnání produktů','porovnání regionů','porovnání zaměstnanců'],
    useCase: 'Porovnává hodnoty mezi kategoriemi. Nejuniverzálnější graf v Power BI.',
    setupSteps: [
      'Přidej vizuál **Sloupcový seskupený** z panelu Vizualizace',
      '**Osa X** → kategorie, které chceš porovnat (Produkt, Region)',
      '**Hodnoty Y** → co měříš pro každou kategorii (SUM míra)',
      'Pro žebříček: klikni "..." → Seřadit sestupně',
      'Pro TOP N: filtr vizuálu → Top N → zadej počet',
    ],
    fields: [
      { role: 'Osa X', hint: 'Kategorie, které chceš porovnat', example: 'Produkt, Region, Zaměstnanec, Oddělení' },
      { role: 'Hodnoty (Y)', hint: 'Co chceš měřit pro každou kategorii', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
      { role: 'Legenda', hint: 'Doplňující rozdělení (volitelné)', example: 'Rok, Kategorie — nechej prázdné pro jednoduchý graf' },
    ],
    daxExample: 'CelkovéTržby = SUM(Objednávky[Tržba])',
    tips: [
      'Max. 15 kategorií na ose X – více je nečitelné',
      'Pro TOP N: přidej filtr vizuálu → Top N',
      'Seřaď sestupně pro přehledný žebříček',
    ],
    alternatives: ['Pruhový graf (vodorovný) pro dlouhé názvy kategorií', 'Skládaný pro zobrazení složení'],
    tutorialId: 'sloupcovy-graf',
    tutorialLabel: 'Návod: Sloupcový graf',
  },
  {
    id: 'line',
    name: 'Spojnicový graf',
    englishName: 'Line Chart',
    icon: '📈',
    color: 'green',
    keys: ['trend','vývoj','průběh','v čase','časový','měsíčně','ročně','za rok','za měsíc','historicky','roste','klesá','výkyvy','denně','týdně','čtvrtletně','časová řada','jak se vyvíjí','jak roste','jak klesá','po měsících','za poslední','vývoj tržeb'],
    useCase: 'Sleduje hodnoty v čase. Ideální pro tržby po měsících, počet uživatelů po týdnech nebo jakékoli časové řady.',
    setupSteps: [
      'Přidej vizuál **Spojnicový graf** z panelu Vizualizace',
      '**Osa X** → pole z datumové tabulky (Datum[MěsícNázev])',
      '**Hodnoty Y** → míra (SUM(Objednávky[Tržba]))',
      '**Legenda** → pro více linií přidej kategorii (Produkty[Kategorie])',
      'Záložka Analýza → přidej klouzavý průměr nebo referenční čáru',
    ],
    fields: [
      { role: 'Osa X', hint: 'Časová dimenze (z datumové tabulky!)', example: 'Datum[MěsícNázev], Datum[Rok], Datum[Týden]' },
      { role: 'Hodnoty (Y)', hint: 'Metrika, jejíž vývoj chceš vidět', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
      { role: 'Legenda', hint: 'Pro více linií – doplňující kategorie', example: 'Produkty[Kategorie] → každá kategorie = samostatná linie' },
    ],
    daxExample: 'TržbyMTD = CALCULATE(SUM(Objednávky[Tržba]), DATESMTD(Datum[Datum]))',
    tips: [
      'Vždy používej datumovou tabulku, ne datum z faktové tabulky',
      'Přidej klouzavý průměr v záložce Analýza pro vyhlazení výkyvů',
      'Kombinuj se sloupcovým grafem (Combo chart) pro dvě metriky',
    ],
    alternatives: ['Plošný graf (Area) pro zdůraznění objemu', 'Sloupcový pro porovnání konkrétních období'],
    tutorialId: 'spojnicovy-graf',
    tutorialLabel: 'Návod: Spojnicový graf',
  },
  {
    id: 'pie',
    name: 'Koláčový / Prstencový graf',
    englishName: 'Pie / Donut Chart',
    icon: '🥧',
    color: 'orange',
    keys: ['podíl','procento','z celku','jak velký','část celku','složení','struktura','jak se dělí','kolik procent','jaký podíl','proporce','rozdělení na','výsečový','prstencový','donut'],
    useCase: 'Zobrazuje podíl kategorií na celku. Použij pouze pro 2–6 kategorií.',
    setupSteps: [
      'Přidej **Koláčový** nebo **Prstencový** graf',
      '**Legenda** → kategorie (co tvoří výseče)',
      '**Hodnoty** → míra (SUM(Tržba))',
      'Záložka Formát → Datové popisky → zapni "% z celku"',
      'Pro prstencový: v záložce Formát nastav velikost středu (Inner radius)',
    ],
    fields: [
      { role: 'Legenda', hint: 'Kategorie (výseče)', example: 'Produkty[Kategorie], Region[Název]' },
      { role: 'Hodnoty', hint: 'Metrika určující velikost výseče', example: 'SUM(Objednávky[Tržba])' },
    ],
    daxExample: 'ProcentoZCelku = DIVIDE(SUM(Objednávky[Tržba]), CALCULATE(SUM(Objednávky[Tržba]), ALL(Objednávky)))',
    tips: [
      'Maximálně 6 kategorií – jinak použij sloupcový',
      'Prstencový (donut) je modernější alternativa s místem ve středu pro celkovou hodnotu',
      'Zapni popisky s procentem – absolutní čísla jsou v koláčovém grafu nečitelná',
    ],
    alternatives: ['Treemap pro hierarchická data nebo více kategorií', 'Sloupcový 100% skládaný pro srovnání podílů ve více skupinách'],
    tutorialId: 'vysecovy-prstencovy-graf',
    tutorialLabel: 'Návod: Výsečový / Prstencový graf',
  },
  {
    id: 'scatter',
    name: 'Rozptylový / Bublinový graf',
    englishName: 'Scatter Plot / Bubble Chart',
    icon: '⚬',
    color: 'purple',
    keys: ['korelace','vztah mezi','závisí','závislost','porovnat dvě metriky','porovnat dvě hodnoty','bubble','osa x a y','scatter','dvě osy','vs','cena a množství','výkon a náklady','zákazníci a tržby','dvě čísla'],
    useCase: 'Odhaluje vztah (korelaci) mezi dvěma metrikami. Každý bod = jedna entita (zákazník, produkt, region).',
    setupSteps: [
      'Přidej vizuál **Bodový graf** z panelu Vizualizace',
      '**Osa X** → první metrika (průměrná cena, počet objednávek)',
      '**Osa Y** → druhá metrika (celkové tržby, ziskovost)',
      '**Hodnoty / Detail** → co každý bod představuje (Zákazníci[Název])',
      '**Velikost** → třetí metrika pro bubliny (volitelné)',
      'Záložka Analýza → přidej Trend linii (lineární regrese)',
    ],
    fields: [
      { role: 'Osa X', hint: 'První metrika (horizontální)', example: 'Průměrná cena, Počet objednávek' },
      { role: 'Osa Y', hint: 'Druhá metrika (vertikální)', example: 'Celkové tržby, Ziskovost' },
      { role: 'Hodnoty / Detail', hint: 'Co každý bod představuje', example: 'Zákazníci[Název], Produkty[Název]' },
      { role: 'Velikost', hint: 'Třetí metrika (velikost bublin)', example: 'Počet objednávek, Marže (volitelné)' },
    ],
    daxExample: 'PrůměrnáObjednávka = AVERAGE(Objednávky[Hodnota])',
    tips: [
      'Osa X i Y musí být míry (ne kategorie)',
      'Přidej Play Axis (Datum[Rok]) pro animaci vývoje bublin v čase',
      'Trend linie v záložce Analýza ukáže směr korelace',
    ],
    alternatives: ['Spojnicový pro sledování jedné metriky v čase'],
    tutorialId: 'rozptylovy-graf',
    tutorialLabel: 'Návod: Rozptylový / Bublinový graf',
  },
  {
    id: 'treemap',
    name: 'Treemap',
    englishName: 'Treemap',
    icon: '🟩',
    color: 'green',
    keys: ['hierarchie','podkategorie','zanořené','největší','které produkty','které kategorie','proporce v kategorii','stromový','rozložení produktů','portfolio','7 kategorií','mnoho kategorií','přehled produktů','struktura portfolia'],
    useCase: 'Zobrazuje hierarchická data jako vnořené obdélníky – velikost = metrika, barva = kategorie. Lepší než koláč pro 7+ kategorií.',
    setupSteps: [
      'Přidej vizuál **Treemap** z panelu Vizualizace',
      '**Skupina** → hlavní kategorie (Produkty[Kategorie])',
      '**Podrobnosti** → podkategorie pro drilldown (Produkty[Název])',
      '**Hodnoty** → metrika = velikost obdélníku (SUM(Tržba))',
      'Pro barvu dle jiné metriky: Formát → Barvy dat → podmíněné formátování',
    ],
    fields: [
      { role: 'Skupina', hint: 'Hlavní kategorie (vnější úroveň)', example: 'Produkty[Kategorie]' },
      { role: 'Podrobnosti', hint: 'Podkategorie (vnitřní úroveň, drill)', example: 'Produkty[Název]' },
      { role: 'Hodnoty', hint: 'Určuje velikost obdélníků', example: 'SUM(Objednávky[Tržba])' },
    ],
    daxExample: 'TržbyProduktu = SUM(Objednávky[Tržba])',
    tips: [
      'Kliknutím na obdélník provedeš drilldown do podkategorie',
      'Ctrl+klik pro výběr více bloků – filtruje zbytek reportu',
      'Barva může zobrazit jinou metriku (např. marži) – pomáhá identifikovat silné vs. slabé produkty',
    ],
    alternatives: ['Koláčový pro jednoduchou proporci bez hierarchie', 'Sloupcový pro přesné porovnání hodnot'],
    tutorialId: 'treemap-vizual',
    tutorialLabel: 'Návod: Treemap',
  },
  {
    id: 'waterfall',
    name: 'Vodopádový graf',
    englishName: 'Waterfall Chart',
    icon: '📉',
    color: 'teal',
    keys: ['vodopád','waterfall','bridge','přírůstek','úbytek','nárůst a pokles','jak se dostaneme','změny','finanční analýza','výsledovka','od startu k cíli','kumulativní změny','faktory ovlivňující','měsíční změna','most','mostový'],
    useCase: 'Zobrazuje postupné přírůstky a úbytky vedoucí k výsledku. Ideální pro finanční Bridge charty.',
    setupSteps: [
      'Přidej vizuál **Vodopádový graf** z panelu Vizualizace',
      '**Kategorie** → kroky/faktory (Datum[MěsícNázev], Finance[Faktor])',
      '**Hodnoty Y** → míra zobrazující ZMĚNU (ne absolutní hodnotu!)',
      'Klikni pravým na první/poslední sloupec → **Nastavit jako celkový**',
      'Záložka Formát → Barvy dat: Zvýšení=zelená, Snížení=červená, Celkový=šedá',
    ],
    fields: [
      { role: 'Kategorie', hint: 'Kroky / faktory změny', example: 'Měsíc, Produkt, Kanál, Typ nákladu' },
      { role: 'Hodnoty (Y)', hint: 'Výše změny (kladná = přírůstek, záporná = úbytek)', example: 'SUM(Finance[Změna])' },
      { role: 'Breakdown', hint: 'Druhá dimenze pro detail (volitelné)', example: 'Finance[Kategorie]' },
    ],
    daxExample: 'ZměnaTržeb = [CelkovéTržby] - [TržbyMinulýMěsíc]',
    tips: [
      'Nastav první a poslední sloupec jako "Celkový" – neukazují přírůstek, ale absolutní hodnotu',
      'Hodnoty musí být ZMĚNY, ne absolutní čísla',
      'Waterfall nefunguje dobře s více než 10–12 kroky',
    ],
    alternatives: ['Sloupcový seskupený pro přímé srovnání bez kumulace'],
    tutorialId: 'vodopady-graf',
    tutorialLabel: 'Návod: Vodopádový graf',
  },
  {
    id: 'card',
    name: 'KPI Karta',
    englishName: 'Card / KPI',
    icon: '🎯',
    color: 'yellow',
    keys: ['celkový počet','jedna hodnota','kpi','karta','ukazatel','výsledek','celkem','kolik celkem','jedno číslo','zobrazit číslo','jak velká je','aktuální hodnota','klíčová metrika','přehled dashboard'],
    useCase: 'Zobrazuje jednu klíčovou metriku prominentně. Základní stavební kámen každého dashboardu.',
    setupSteps: [
      'Přidej vizuál **Karta** nebo **KPI** z panelu Vizualizace',
      '**Hodnoty** → jedna míra (SUM(Tržby), COUNTROWS(Zákazníci))',
      'Nastav formát míry v záložce Nástroje měření (Kč, %, ks)',
      'Pro KPI: přidej Cíl (Target) a Trend (Datum) pro % splnění',
      'Nový vizuál Karta (2024+): Formát → Rozložení → více hodnot + sparkline',
    ],
    fields: [
      { role: 'Hodnoty (pole)', hint: 'Jedna míra nebo agregace', example: 'SUM(Tržby), COUNTROWS(Zákazníci), [CelkovéTržby]' },
    ],
    daxExample: 'CelkovéTržby = SUM(Objednávky[Tržba])',
    tips: [
      'KPI karta: přidej Cíl (Target) → zobrazí % splnění s barevným indikátorem',
      'Nový vizuál "Karta (nová)" podporuje sparkline přímo v kartě',
      'Podmíněné formátování: červená/zelená podle splnění cíle přes DAX míru barvy',
    ],
    alternatives: ['Gauge pro zobrazení hodnoty vůči cíli s ciferníkem'],
    tutorialId: 'kpi-karta-dax',
    tutorialLabel: 'Návod: KPI karta s DAX',
  },
  {
    id: 'matrix',
    name: 'Matice (Matrix)',
    englishName: 'Matrix / Pivot Table',
    icon: '📋',
    color: 'gray',
    keys: ['tabulka','matrix','kontingenční','křížové','řádky a sloupce','matice','produkt po měsících','srovnat přes dvě dimenze','rok a produkt','oddělení a rok','kategorie a čas','pivot'],
    useCase: 'Křížová tabulka – porovnání hodnot přes dvě dimenze (řádky × sloupce). Ekvivalent pivot tabulky v Excelu.',
    setupSteps: [
      'Přidej vizuál **Matice** z panelu Vizualizace',
      '**Řádky** → první dimenze (Produkty[Kategorie])',
      '**Sloupce** → druhá dimenze (Datum[Rok])',
      '**Hodnoty** → co se zobrazí v buňkách (SUM(Tržba))',
      'Záložka Formát → Podmíněné formátování → Barevná škála pro tepelnou mapu',
    ],
    fields: [
      { role: 'Řádky', hint: 'První dimenze (řádky)', example: 'Produkty[Kategorie], Zaměstnanci[Oddělení]' },
      { role: 'Sloupce', hint: 'Druhá dimenze (záhlaví sloupců)', example: 'Datum[Rok], Datum[Čtvrtletí]' },
      { role: 'Hodnoty', hint: 'Co se zobrazí v buňkách', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
    ],
    daxExample: 'TržbyPodleRokuAKategorie = SUM(Objednávky[Tržba])',
    tips: [
      'Přidej podmíněné formátování → tepelná mapa bez dalšího kódu',
      'Zapni mezisoučty pro přehled na úrovni skupiny',
      'Hierarchie v Řádcích umožňuje drill (Kategorie → Produkt)',
    ],
    alternatives: ['Sloupcový pro méně kombinací dimenzí'],
    tutorialId: 'matice-vizual',
    tutorialLabel: 'Návod: Matice / Pivot tabulka',
  },
  {
    id: 'gauge',
    name: 'Tachometrový graf',
    englishName: 'Gauge Chart',
    icon: '🕐',
    color: 'purple',
    keys: ['tachometr','gauge','cíl','splnění cíle','procento plnění','jak moc splněno','ukazatel plnění','měřič','do cíle','kolik zbývá do','plnění plánu'],
    useCase: 'Zobrazuje aktuální hodnotu vůči cíli jako ciferník. Ideální pro sledování plnění KPI.',
    setupSteps: [
      'Přidej vizuál **Měřidlo (Gauge)** z panelu Vizualizace',
      '**Hodnota** → aktuální metrika (SUM(Tržba))',
      '**Minimální hodnota** → 0 nebo spodní hranice (volitelné)',
      '**Maximální hodnota / Cíl** → plánovaná hodnota (SUM(Plán[Tržba]))',
      'Záložka Formát → nastavení barev oblastí (červená/žlutá/zelená)',
    ],
    fields: [
      { role: 'Hodnota', hint: 'Aktuální hodnota (ručička)', example: 'SUM(Tržby), [CelkovéTržby]' },
      { role: 'Cílová hodnota', hint: 'Maximum (kde je cíl)', example: '[PlanovanéTržby], konstanta' },
      { role: 'Min / Max', hint: 'Rozsah ciferníku (volitelné)', example: '0 a horní hranice' },
    ],
    daxExample: 'PlněníCíle% = DIVIDE([CelkovéTržby], [PlanovanéTržby])',
    tips: [
      'Gauge je vizuálně poutavý, ale méně přesný než karta s % – uvažuj o kombinaci',
      'Nastav barevné oblasti: červená 0–60%, žlutá 60–85%, zelená 85–100%',
      'Alternativně použij KPI vizuál – ten zobrazí plnění číselně s barevným stavem',
    ],
    alternatives: ['KPI karta pro číselné porovnání s cílem', 'Sloupcový graf s referenční čárou cíle'],
    tutorialId: 'kpi-karta-dax',
    tutorialLabel: 'Návod: KPI karta s DAX',
  },
  {
    id: 'map',
    name: 'Mapový / Plný mapový graf',
    englishName: 'Map / Filled Map',
    icon: '🗺️',
    color: 'teal',
    keys: ['mapa','geografický','regiony','kraje','města','státy','geograficky','kde','lokace','gps','zeměpisný','plochá mapa','geografie','zákazníci v','tržby podle regionu','po krajích'],
    useCase: 'Zobrazuje data na geografické mapě. Ideální pro tržby po regionech, počet zákazníků v krajích.',
    setupSteps: [
      'Nastav kategorii dat sloupce: záložka Nástroje sloupce → Kategorie dat → Město/Kraj/Země',
      'Přidej vizuál **Mapa** nebo **Plná mapa** z panelu Vizualizace',
      '**Umístění** → geografický sloupec (Zákazníci[Kraj])',
      '**Velikost bubliny / Sytost barev** → metrika (SUM(Tržba))',
      'Plná mapa: zobrazí celé regiony obarvené dle hodnoty',
    ],
    fields: [
      { role: 'Umístění', hint: 'Geografický sloupec se správnou kategorií dat', example: 'Zákazníci[Kraj], Zákazníci[Město]' },
      { role: 'Velikost / Hodnota', hint: 'Metrika = velikost bubliny nebo intenzita barvy', example: 'SUM(Objednávky[Tržba]), COUNTROWS(...)' },
      { role: 'Legenda', hint: 'Barevné rozdělení (volitelné)', example: 'Produkty[Kategorie]' },
    ],
    daxExample: 'TržbyRegionu = SUM(Objednávky[Tržba])',
    tips: [
      'Nastav kategorii dat geografickým sloupcům PŘED přidáním do vizuálu – jinak mapa nerozezná sloupec',
      'Power BI potřebuje internet pro načtení podkladové mapy (Bing Maps)',
      'Pro přesné zobrazení použij zeměpisnou šířku (Latitude) a délku (Longitude)',
    ],
    alternatives: ['Sloupcový graf pro přesnější srovnání regionů bez mapy'],
    tutorialId: null,
    tutorialLabel: null,
  },
  {
    id: 'funnel',
    name: 'Trychtýřový graf',
    englishName: 'Funnel Chart',
    icon: '🔽',
    color: 'orange',
    keys: ['trychtýř','funnel','konverzní','konverze','fáze','pipeline','prodejní','kroky prodeje','kolik zbyde','odpad','ztráta v každém','průchodnost','retention','odchod','zákaznická cesta'],
    useCase: 'Zobrazuje postupné zmenšování hodnoty přes fáze procesu – konverzní cesta, sales pipeline.',
    setupSteps: [
      'Přidej vizuál **Trychtýřový graf** z panelu Vizualizace',
      '**Skupina** → fáze procesu (Leady, Příležitosti, Nabídky, Objednávky)',
      '**Hodnoty** → počet nebo hodnota v dané fázi',
      'Záložka Formát → zapni popisky s % z předchozí fáze',
      'Data musí být seřazena dle pořadí fází – nastav třídění',
    ],
    fields: [
      { role: 'Skupina', hint: 'Fáze procesu (osa Y)', example: 'Příležitosti[Fáze], Zákazníci[Status]' },
      { role: 'Hodnoty', hint: 'Počet nebo hodnota v každé fázi', example: 'COUNTROWS(Příležitosti), SUM(Hodnota)' },
    ],
    daxExample: 'KonverzeProcento = DIVIDE([PočetObjednávek], [PočetLeadů])',
    tips: [
      'Data musí být seřazena od největší po nejmenší hodnotu',
      'Zapni popisky s % z předchozí fáze pro zobrazení konverzního poměru',
      'Trychtýř je vhodný pro max. 6–8 fází',
    ],
    alternatives: ['Sloupcový pruhový pro přesnější porovnání bez vizuálu trychtýře'],
    tutorialId: null,
    tutorialLabel: null,
  },
];

// ─── Scoring/Matching logic ───────────────────────────────────────────────────

function scoreChart(rule, lower) {
  let score = 0;
  for (const k of rule.keys) {
    if (lower.includes(k)) score += k.split(' ').length; // delší shoda = více bodů
  }
  return score;
}

function matchCharts(input) {
  const lower = input.toLowerCase();
  const scored = chartRules
    .map(rule => ({ rule, score: scoreChart(rule, lower) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0].score > 0 ? scored[0].rule : chartRules.find(r => r.id === 'clustered-column');
  const alts = scored
    .filter(s => s.score > 0 && s.rule.id !== best.id)
    .slice(0, 2)
    .map(s => s.rule);

  return { best, alts };
}

function extractEntities(input) {
  const lower = input.toLowerCase();
  const hints = {};
  if (lower.includes('oddělení')) hints.xExample = 'Zaměstnanci[Oddělení]';
  if (lower.includes('region')) hints.xExample = 'Region[Název]';
  if (lower.includes('produkt')) hints.xExample = 'Produkty[Název]';
  if (lower.includes('kategori')) hints.xExample = 'Produkty[Kategorie]';
  if (lower.includes('pohlaví') || lower.includes('mužů') || lower.includes('žen') || lower.includes('muži') || lower.includes('ženy'))
    hints.legendExample = 'Zaměstnanci[Pohlaví]';
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
    if ((role.includes('osa x') || role.includes('kategorie') || role.includes('skupina') || role.includes('řádky') || role.includes('umístění')) && hints.xExample)
      ex = hints.xExample + ' (nebo ' + f.example + ')';
    if (role.includes('legenda') && hints.legendExample)
      ex = hints.legendExample + ' (nebo ' + f.example + ')';
    if ((role.includes('hodnot') || role.includes('osa y')) && hints.valueExample)
      ex = hints.valueExample + ' (nebo ' + f.example + ')';
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
  'Jak se dostaneme od tržeb k zisku (bridge chart)',
  'Celkový počet zákazníků na dashboardu',
  'Hierarchie kategorií a podkategorií produktů',
  'Splnění cíle tržeb – kolik zbývá do plánu',
  'Tržby po krajích České republiky',
];

// ─── All chart types overview ─────────────────────────────────────────────────

const chartOverview = [
  { icon: '📊', name: 'Sloupcový', desc: 'Porovnání kategorií' },
  { icon: '📈', name: 'Spojnicový', desc: 'Trend v čase' },
  { icon: '🥧', name: 'Koláčový', desc: 'Podíl z celku' },
  { icon: '⚬', name: 'Bodový', desc: 'Korelace 2 metrik' },
  { icon: '🟩', name: 'Treemap', desc: 'Hierarchie' },
  { icon: '📉', name: 'Vodopád', desc: 'Přírůstky/úbytky' },
  { icon: '🎯', name: 'KPI Karta', desc: 'Jedno číslo' },
  { icon: '📋', name: 'Matice', desc: 'Pivot tabulka' },
  { icon: '🕐', name: 'Tachometr', desc: 'Plnění cíle' },
  { icon: '🗺️', name: 'Mapa', desc: 'Geografická data' },
  { icon: '🔽', name: 'Trychtýř', desc: 'Konverzní cesta' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChartAdvisor() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleAdvisory = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setShowSetup(false);
    setTimeout(() => {
      const { best, alts } = matchCharts(input);
      const hints = extractEntities(input);
      const personalizedFields = personalizeFields(best.fields, hints);
      setResult({ chart: best, personalizedFields, alternatives: alts });
      setLoading(false);
    }, 350);
  };

  const loadExample = (ex) => {
    setInput(ex);
    setResult(null);
  };

  const colors = result ? (colorMap[result.chart.color] || colorMap.blue) : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <BarChart2 size={22} className="text-yellow-400" />
          Průvodce výběrem grafu
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Popiš, co chceš zobrazit – dostaneš doporučení grafu, nastavení polí a krok-za-krokem průvodce
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
                  placeholder="Např. Chci zobrazit vývoj tržeb po měsících za poslední rok…"
                  className="textarea h-24"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Piš přirozeně česky – napiš co chceš vidět a aplikace pozná správný typ grafu.
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
                {result.chart.tutorialId && (
                  <Link
                    to={`/tutorials/${result.chart.tutorialId}`}
                    className="btn-ghost text-xs gap-1.5 flex-shrink-0"
                  >
                    <BookOpen size={13} /> Návod
                  </Link>
                )}
              </div>

              {/* Use case */}
              <div className="p-3 rounded-lg bg-white/3 border border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed">{result.chart.useCase}</p>
              </div>

              {/* Step by step setup */}
              <div>
                <button
                  onClick={() => setShowSetup(s => !s)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors mb-3"
                >
                  <Layout size={13} className="text-brand-400" />
                  {showSetup ? 'Skrýt' : 'Zobrazit'} průvodce nastavením krok za krokem
                  <ChevronRight size={12} className={`transition-transform ${showSetup ? 'rotate-90' : ''}`} />
                </button>
                {showSetup && (
                  <div className="space-y-2">
                    {result.chart.setupSteps.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${colors.badge}`}>
                          {i + 1}
                        </span>
                        <p className="text-xs text-gray-300 leading-snug" dangerouslySetInnerHTML={{
                          __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field mapping */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Co dát kam
                </h3>
                <div className="space-y-2">
                  {result.personalizedFields.map((f, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
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
                  <CodeBlock code={result.chart.daxExample} language="dax" title="DAX" onExport={false} />
                </div>
              )}

              {/* Tips */}
              {result.chart.tips?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Tipy a vychytávky
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

              {/* Other matching charts */}
              {result.alternatives?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Také zvažuj
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {result.alternatives.map((alt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const hints = extractEntities(input);
                          const personalizedFields = personalizeFields(alt.fields, hints);
                          setResult({ chart: alt, personalizedFields, alternatives: [] });
                          setShowSetup(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs text-gray-300"
                      >
                        <span>{alt.icon}</span> {alt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutorial link */}
              {result.chart.tutorialId && (
                <Link
                  to={`/tutorials/${result.chart.tutorialId}`}
                  className="flex items-center gap-2 p-3 rounded-lg bg-brand-500/5 border border-brand-500/15 hover:bg-brand-500/10 transition-all group"
                >
                  <BookOpen size={14} className="text-brand-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-400">{result.chart.tutorialLabel}</p>
                    <p className="text-xs text-gray-500">Krok za krokem s ukázkami kódu</p>
                  </div>
                  <ChevronRight size={13} className="text-brand-500/50 group-hover:text-brand-400 transition-colors" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right – quick examples + chart overview */}
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

          {/* All chart types overview */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Layout size={15} className="text-gray-500" /> Přehled typů grafů
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {chartOverview.map((c, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(c.desc)}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-white/3 hover:bg-white/8 transition-all text-left"
                >
                  <span className="text-base leading-none">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-300 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-600 truncate">{c.desc}</p>
                  </div>
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
              <p className="text-gray-600">Klíčová slova jako <span className="text-gray-400 italic">trend, podíl, korelace, hierarchie, cíl, mapa</span> ovlivňují výsledek.</p>
              <p className="text-gray-600">Pokud se shoduje více typů, zobrazí se sekce <span className="text-gray-400">"Také zvažuj"</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
