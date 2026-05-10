// DAX a M Query generátory (client-side, bez backendu)

const daxTemplates = [
  {
    keys: ['součet','suma','celkem','total','sum','sečti','celkové'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Celkem'} = SUM(${t}[${c}])`,
      explanation: `Spočítá součet všech číselných hodnot ve sloupci **${c}** tabulky **${t}**. BLANK hodnoty jsou automaticky ignorovány.`,
      syntax: 'SUM(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje pouze s číselnými sloupci','Pro výpočet na řádku použij SUMX'],
    }),
  },
  {
    keys: ['průměr','average','avg','střední hodnota','průměrný'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Průměr'} = AVERAGE(${t}[${c}])`,
      explanation: `Vypočítá aritmetický průměr hodnot ve sloupci **${c}**. BLANK hodnoty jsou ignorovány.`,
      syntax: 'AVERAGE(<sloupec>)',
      category: 'Agregace',
      tips: ['BLANK ≠ 0, nulové hodnoty průměr ovlivní','Pro vážený průměr: SUMX / COUNT'],
    }),
  },
  {
    keys: ['počet','kolik','count','countrows','záznamy','řádků','záznamů'],
    gen: (t, c, alias) => ({
      code: `${alias || 'PočetZáznamů'} = COUNTROWS(${t})`,
      explanation: `Spočítá celkový počet řádků v tabulce **${t}**. Pokud chceš počítat nenulové hodnoty ve sloupci: COUNT(${t}[${c}]).`,
      syntax: 'COUNTROWS(<tabulka>)',
      category: 'Agregace',
      tips: ['COUNTROWS počítá všechny řádky včetně BLANK','COUNT ignoruje BLANK','COUNTA počítá i textové hodnoty'],
    }),
  },
  {
    keys: ['unikátní','distinct','unique','různých','jedineční','odlišných'],
    gen: (t, c, alias) => ({
      code: `${alias || 'Unikátní' + c} = DISTINCTCOUNT(${t}[${c}])`,
      explanation: `Spočítá počet jedinečných hodnot ve sloupci **${c}** tabulky **${t}**. Duplicity se počítají jednou.`,
      syntax: 'DISTINCTCOUNT(<sloupec>)',
      category: 'Agregace',
      tips: ['Ideální pro počítání zákazníků, produktů apod.'],
    }),
  },
  {
    keys: ['maximum','nejvyšší','max','největší'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Max'} = MAX(${t}[${c}])`,
      explanation: `Vrátí nejvyšší hodnotu ve sloupci **${c}** tabulky **${t}**.`,
      syntax: 'MAX(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje i s daty (vrátí nejpozdější datum)'],
    }),
  },
  {
    keys: ['minimum','nejnižší','min','nejmenší'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Min'} = MIN(${t}[${c}])`,
      explanation: `Vrátí nejnižší hodnotu ve sloupci **${c}** tabulky **${t}**.`,
      syntax: 'MIN(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje i s daty (vrátí nejstarší datum)'],
    }),
  },
  {
    keys: ['ytd','year to date','od začátku roku','kumulativní rok','roční kumulace'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'YTD'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    DATESYTD(Datum[Datum])\n)`,
      explanation: `Kumulativní součet sloupce **${c}** od 1. ledna do aktuálního data. Vyžaduje datumovou tabulku **Datum** s sloupcem **Datum**.`,
      syntax: 'CALCULATE(<výraz>, DATESYTD(<datum_sloupec>))',
      category: 'Časová inteligence',
      tips: ['Musí existovat propojená datumová tabulka','Pro fiskální rok: DATESYTD(Datum[Datum], "3-31")'],
    }),
  },
  {
    keys: ['mtd','month to date','od začátku měsíce'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'MTD'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    DATESMTD(Datum[Datum])\n)`,
      explanation: `Kumulativní součet sloupce **${c}** od začátku aktuálního měsíce.`,
      syntax: 'CALCULATE(<výraz>, DATESMTD(<datum_sloupec>))',
      category: 'Časová inteligence',
      tips: ['Analogicky QTD: DATESQTD()'],
    }),
  },
  {
    keys: ['předchozí rok','minulý rok','loni','last year','pytd','prior year','stejné období'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'MinulýRok'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    SAMEPERIODLASTYEAR(Datum[Datum])\n)`,
      explanation: `Součet sloupce **${c}** za stejné období minulého roku. Ideální pro meziroční srovnání (Year-over-Year).`,
      syntax: 'CALCULATE(<výraz>, SAMEPERIODLASTYEAR(<datum_sloupec>))',
      category: 'Časová inteligence',
      tips: ['Kombinuj s YTD pro PYTD metriky'],
    }),
  },
  {
    keys: ['procento','podíl','percent','percentage','% z celku','procentuální','share'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Procento'} =\nDIVIDE(\n    SUM(${t}[${c}]),\n    CALCULATE(\n        SUM(${t}[${c}]),\n        ALL(${t})\n    )\n)`,
      explanation: `Procentuální podíl aktuálního kontextu na celkovém součtu (bez filtrů). Formátuj sloupec jako **procenta**.`,
      syntax: 'DIVIDE(<čitatel>, <jmenovatel>, [<při_nule>])',
      category: 'Matematika',
      tips: ['DIVIDE automaticky ošetří dělení nulou','Nastav formát na procenta v záložce Nástroje míry'],
    }),
  },
  {
    keys: ['podmínka','pokud','když','if','switch','případ','větší než','menší než'],
    gen: (t, c, alias) => ({
      code: `${alias || 'Kategorie'} =\nIF(\n    ${t}[${c}] > 0,\n    "Kladné",\n    IF(\n        ${t}[${c}] = 0,\n        "Nula",\n        "Záporné"\n    )\n)`,
      explanation: `Podmíněné vyhodnocení sloupce **${c}**. Uprav podmínku a návratové hodnoty dle potřeby.`,
      syntax: 'IF(<podmínka>, <pokud_pravda>, [<pokud_nepravda>])',
      category: 'Logika',
      tips: ['Pro více podmínek je přehlednější SWITCH(TRUE(), ...)','Prázdná "nepravda" vrátí BLANK'],
    }),
  },
  {
    keys: ['pořadí','rank','ranking','žebříček','rankx'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Pořadí'} =\nRANKX(\n    ALL(${t}),\n    [${c}Celkem],,\n    DESC,\n    Dense\n)`,
      explanation: `Přiřadí pořadí od největšího záznamu. ALL zajistí pořadí bez filtrů.`,
      syntax: 'RANKX(<tabulka>, <výraz>, [<hodnota>], [<pořadí>], [<vazby>])',
      category: 'Statistika',
      tips: ['ASC = vzestupně, DESC = sestupně','Dense = bez mezer při shodě'],
    }),
  },
  {
    keys: ['průběžný součet','running total','kumulativní součet','kumulace přes čas'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Kumulativní'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    FILTER(\n        ALL(Datum[Datum]),\n        Datum[Datum] <= MAX(Datum[Datum])\n    )\n)`,
      explanation: `Průběžný kumulativní součet sloupce **${c}** přes čas – každý bod zobrazuje součet od začátku.`,
      syntax: 'CALCULATE(SUM(...), FILTER(ALL(Datum[Datum]), ...))',
      category: 'Časová inteligence',
      tips: ['Vyžaduje datumovou tabulku propojenou s fakty'],
    }),
  },
  {
    keys: ['calculate','filtrovaný','s filtrem','podmíněný výpočet'],
    gen: (t, c, alias) => ({
      code: `${alias || 'FiltrovanýSoučet'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    ${t}[Kategorie] = "Hodnota"\n)`,
      explanation: `CALCULATE je nejdůležitější DAX funkce – vyhodnotí výraz v modifikovaném kontextu filtru. Nahraď podmínku svou hodnotou.`,
      syntax: 'CALCULATE(<výraz>, [<filtr1>], [<filtr2>], ...)',
      category: 'Filtr',
      tips: ['Filtry jsou spojeny AND','Pro OR použij funkci IN nebo OR()'],
    }),
  },
  {
    keys: ['sumx','iterace','násobení řádků','výpočet na každém řádku'],
    gen: (t, c, alias) => ({
      code: `${alias || 'VýsledekSUMX'} =\nSUMX(\n    ${t},\n    ${t}[${c}] * ${t}[Množství]\n)`,
      explanation: `SUMX iteruje přes každý řádek tabulky **${t}** a vypočítá výraz, pak vše sečte. Uprav výraz pro svůj výpočet.`,
      syntax: 'SUMX(<tabulka>, <výraz_pro_každý_řádek>)',
      category: 'Iterátoři',
      tips: ['Výkonnostně náročnější než SUM','AVERAGEX, MINX, MAXX fungují analogicky'],
    }),
  },
];

export function generateDAX(description, tableName, columnName, measureName) {
  const desc = description.toLowerCase();
  const t = tableName.trim();
  const c = columnName.trim();
  const alias = measureName?.trim() || null;

  for (const tpl of daxTemplates) {
    if (tpl.keys.some(k => desc.includes(k))) {
      return tpl.gen(t, c, alias);
    }
  }
  // Default: SUM
  return daxTemplates[0].gen(t, c, alias);
}

// ── M Query generators ──────────────────────────────────────────────────────

const mGenerators = {
  'filter-equals': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] = "${p.value || 'Hodnota'}")\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde **${c}** = "${p.value || 'Hodnota'}".`,
    notes: 'Pro číselné hodnoty odstraň uvozovky: each [Sloupec] = 100',
  }),
  'filter-greater': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] > ${p.value || '0'})\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde **${c}** > ${p.value || '0'}.`,
    notes: 'Pro >= použij >= místo >',
  }),
  'filter-less': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] < ${p.value || '0'})\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde **${c}** < ${p.value || '0'}.`,
    notes: 'Pro <= použij <= místo <',
  }),
  'filter-contains': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(\n        Zdroj,\n        each Text.Contains([${c}], "${p.value || 'text'}", Comparer.OrdinalIgnoreCase)\n    )\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde **${c}** obsahuje "${p.value || 'text'}" (bez ohledu na velikost písmen).`,
    notes: 'Odstraň Comparer.OrdinalIgnoreCase pokud chceš rozlišovat velká a malá písmena',
  }),
  'filter-not-null': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnoNull = Table.SelectRows(Zdroj, each [${c}] <> null)\nin\n    OdstraněnoNull`,
    explanation: `Odstraní řádky, kde sloupec **${c}** je null (prázdný).`,
    notes: 'Pro kontrolu více sloupců použij and: each [Sloupec1] <> null and [Sloupec2] <> null',
  }),
  'remove-column': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnýSloupec = Table.RemoveColumns(Zdroj, {"${c}"})\nin\n    OdstraněnýSloupec`,
    explanation: `Odstraní sloupec **${c}** z tabulky **${t}**.`,
    notes: 'Pro více sloupců: Table.RemoveColumns(Zdroj, {"Sloupec1", "Sloupec2"})',
  }),
  'rename-column': (t, c, p) => {
    const nn = p.newName || 'NovýNázev';
    return {
      code: `let\n    Zdroj = ${t},\n    PřejmenovánoSloupce = Table.RenameColumns(Zdroj, {{"${c}", "${nn}"}})\nin\n    PřejmenovánoSloupce`,
      explanation: `Přejmenuje sloupec **${c}** na **${nn}**.`,
      notes: 'Pro více přejmenování: {{"Starý1","Nový1"}, {"Starý2","Nový2"}}',
    };
  },
  'change-type-text': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type text}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Text**.`,
    notes: 'Většina hodnot se dá převést na text',
  }),
  'change-type-number': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type number}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Číslo (Decimal)**. Nepřevoditelné hodnoty budou null.`,
    notes: 'Pro celé číslo: Int64.Type; pro pevnou desetinnou čárku: Currency.Type',
  }),
  'change-type-date': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type date}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Datum**.`,
    notes: 'Formát data musí být rozpoznatelný. Pro datum+čas: type datetime',
  }),
  'add-column': (t, c, p) => {
    const nn = p.newName || 'NovýSloupec';
    return {
      code: `let\n    Zdroj = ${t},\n    PřidanýSloupec = Table.AddColumn(\n        Zdroj,\n        "${nn}",\n        each [${c}] * 2,\n        type number\n    )\nin\n    PřidanýSloupec`,
      explanation: `Přidá nový sloupec **${nn}** s výpočtem z hodnot sloupce **${c}**. Uprav výraz \`each [...]\`.`,
      notes: 'Typy: type text, type number, type date, type logical',
    };
  },
  'group-by': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Seskupeno = Table.Group(\n        Zdroj,\n        {"${c}"},\n        {\n            {"Součet", each List.Sum([${p.aggColumn || c}]), type number},\n            {"Počet",  each Table.RowCount(_), Int64.Type}\n        }\n    )\nin\n    Seskupeno`,
    explanation: `Seskupí tabulku **${t}** podle sloupce **${c}** a vypočítá součet a počet pro každou skupinu.`,
    notes: 'Nahraď List.Sum() za List.Average(), List.Max(), List.Min() dle potřeby',
  }),
  'sort-asc': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Seřazeno = Table.Sort(Zdroj, {{"${c}", Order.Ascending}})\nin\n    Seřazeno`,
    explanation: `Seřadí tabulku **${t}** podle sloupce **${c}** vzestupně (A→Z, 1→9).`,
    notes: 'Pro více sloupců: {{"Sloupec1", Order.Ascending}, {"Sloupec2", Order.Descending}}',
  }),
  'sort-desc': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Seřazeno = Table.Sort(Zdroj, {{"${c}", Order.Descending}})\nin\n    Seřazeno`,
    explanation: `Seřadí tabulku **${t}** podle sloupce **${c}** sestupně (Z→A, 9→1).`,
    notes: 'Pro více sloupců: {{"Sloupec1", Order.Descending}, {"Sloupec2", Order.Ascending}}',
  }),
  'remove-duplicates': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnéDuplikáty = Table.Distinct(Zdroj, {"${c}"})\nin\n    OdstraněnéDuplikáty`,
    explanation: `Odstraní duplicitní řádky podle sloupce **${c}**. Zachová první výskyt.`,
    notes: 'Pro deduplikaci podle více sloupců: {"Sloupec1", "Sloupec2"}',
  }),
  'replace-value': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    NahrazenáHodnota = Table.ReplaceValue(\n        Zdroj,\n        "${p.oldValue || 'StaráHodnota'}",\n        "${p.newValue || 'NováHodnota'}",\n        Replacer.ReplaceValue,\n        {"${c}"}\n    )\nin\n    NahrazenáHodnota`,
    explanation: `Nahradí "${p.oldValue || 'StaráHodnota'}" za "${p.newValue || 'NováHodnota'}" ve sloupci **${c}**.`,
    notes: 'Replacer.ReplaceText nahrazuje část textu; Replacer.ReplaceValue nahrazuje celou buňku',
  }),
  'split-column': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    RozdělenýSloupec = Table.SplitColumn(\n        Zdroj,\n        "${c}",\n        Splitter.SplitTextByDelimiter("${p.delimiter || ','}"),\n        {"${c}.1", "${c}.2"}\n    )\nin\n    RozdělenýSloupec`,
    explanation: `Rozdělí sloupec **${c}** podle oddělovače "${p.delimiter || ','}".`,
    notes: 'Uprav počet výsledných sloupců v posledním argumentu',
  }),
  'fill-down': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    VyplněnoDolů = Table.FillDown(Zdroj, {"${c}"})\nin\n    VyplněnoDolů`,
    explanation: `Vyplní prázdné (null) buňky ve sloupci **${c}** hodnotou z předchozího neprázdného řádku.`,
    notes: 'Table.FillUp funguje opačně (vyplňuje nahoru)',
  }),
  'unpivot': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Unpivot = Table.UnpivotOtherColumns(\n        Zdroj,\n        {"${c}"},\n        "Atribut",\n        "Hodnota"\n    )\nin\n    Unpivot`,
    explanation: `Převede všechny sloupce KROMĚ **${c}** do dlouhého formátu (Atribut/Hodnota páry).`,
    notes: 'Pro unpivot konkrétních sloupců: Table.Unpivot(Zdroj, {"S1","S2"}, "Atribut", "Hodnota")',
  }),
};

export function generateMQuery(tableName, columnName, operation, params = {}) {
  const t = tableName.trim();
  const c = columnName.trim();
  const gen = mGenerators[operation];
  if (!gen) return null;
  return gen(t, c, params);
}

export const mOperations = [
  { group: 'Filtrování',   items: [
    { value: 'filter-equals',   label: 'Filtr: rovná se (=)' },
    { value: 'filter-greater',  label: 'Filtr: větší než (>)' },
    { value: 'filter-less',     label: 'Filtr: menší než (<)' },
    { value: 'filter-contains', label: 'Filtr: obsahuje text' },
    { value: 'filter-not-null', label: 'Filtr: odstraň prázdné (null)' },
  ]},
  { group: 'Sloupce', items: [
    { value: 'remove-column',       label: 'Odstraň sloupec' },
    { value: 'rename-column',       label: 'Přejmenuj sloupec' },
    { value: 'change-type-text',    label: 'Změna typu → Text' },
    { value: 'change-type-number',  label: 'Změna typu → Číslo' },
    { value: 'change-type-date',    label: 'Změna typu → Datum' },
    { value: 'add-column',          label: 'Přidej vypočítaný sloupec' },
  ]},
  { group: 'Řazení & Deduplikace', items: [
    { value: 'sort-asc',          label: 'Seřaď vzestupně (A→Z)' },
    { value: 'sort-desc',         label: 'Seřaď sestupně (Z→A)' },
    { value: 'remove-duplicates', label: 'Odstraň duplicity' },
  ]},
  { group: 'Transformace', items: [
    { value: 'group-by',     label: 'Seskup a agreguj' },
    { value: 'replace-value',label: 'Nahraď hodnotu' },
    { value: 'split-column', label: 'Rozděl sloupec oddělovačem' },
    { value: 'fill-down',    label: 'Vyplň dolů (Fill Down)' },
    { value: 'unpivot',      label: 'Unpivot sloupců' },
  ]},
];
