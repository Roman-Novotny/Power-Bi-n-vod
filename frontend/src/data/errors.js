export const errors = [
  {
    id: 'circular-dependency',
    title: 'Circular Dependency (Cyklická závislost)',
    category: 'Model',
    severity: 'error',
    description: 'Nastane, když dva nebo více výpočtů na sobě navzájem závisí – vznikne nekonečná smyčka.',
    symptoms: [
      'Chybová zpráva: "A circular dependency was detected"',
      'DAX výraz nelze vyhodnotit ani uložit',
      'Power BI označí výpočet červeně',
    ],
    causes: [
      'Sloupec A se vypočítává ze Sloupce B, který se vypočítává ze Sloupce A',
      'Measure odkazuje sama na sebe přímo nebo přes jiné measures',
      'Komplexní řetěz závislostí přes více tabulek',
    ],
    solutions: [
      {
        title: 'Nakresli si diagram závislostí',
        content: 'Identifikuj, které výpočty na sobě závisí. Power BI Tools → DAX Studio může pomoci vizualizovat závislosti.',
        code: null,
      },
      {
        title: 'Přepiš výraz bez cyklické závislosti',
        content: 'Odkaž oba výpočty na společný základ (sloupec dat) místo na sebe navzájem.',
        code: '-- Špatně (cyklické):\n-- SloupecA = SloupecB * 2\n-- SloupecB = SloupecA + 1  ← problém!\n\n-- Správně:\nSloupecA = Tabulka[ZákladníHodnota] * 2\nSloupecB = Tabulka[ZákladníHodnota] + 1',
      },
    ],
  },
  {
    id: 'ambiguous-relationship',
    title: 'Ambiguous Relationship (Nejednoznačná relace)',
    category: 'Relace',
    severity: 'error',
    description: 'Power BI nemůže určit, přes kterou relaci má filtrovat data, protože existuje více možných cest.',
    symptoms: [
      'Chybová zpráva: "Relationship ... is ambiguous"',
      'Výpočty vracejí neočekávané výsledky',
      'Varování v zobrazení datového modelu',
    ],
    causes: [
      'Mezi dvěma tabulkami existují dvě nebo více aktivních relací',
      'Obousměrné filtrování vytváří více cest k datům',
      'Komplexní model s mnoha propojených tabulek',
    ],
    solutions: [
      {
        title: 'Deaktivuj přebytečné relace',
        content: 'V zobrazení Model dvakrát klikni na čáru relace a deaktivuj ji (zruš zaškrtnutí "Aktivní").',
        code: null,
      },
      {
        title: 'Použij USERELATIONSHIP pro neaktivní relaci',
        content: 'Neaktivní relaci aktivuješ explicitně pomocí USERELATIONSHIP v CALCULATE.',
        code: 'TržbyPodleDodání = CALCULATE(\n    SUM(Objednávky[Tržba]),\n    USERELATIONSHIP(Objednávky[DatumDodání], Datum[Date])\n)',
      },
      {
        title: 'Přepni na jednosměrný filtr',
        content: 'Obousměrné filtrování je hlavním zdrojem nejednoznačností. Přepni tam, kde je to možné, na jednosměrný filtr.',
        code: null,
      },
    ],
  },
  {
    id: 'blank-values',
    title: 'Blank Values (Prázdné hodnoty / BLANK)',
    category: 'Data',
    severity: 'warning',
    description: 'BLANK je speciální hodnota v DAX – liší se od nuly (0) i od prázdného řetězce (""). Může způsobit neočekávané chování.',
    symptoms: [
      'Výpočty vrací BLANK místo 0',
      'Grafy mají mezery nebo nezobrazují data',
      'Podmínky IF fungují jinak, než očekáváš',
      'Průměry jsou zkresleny (BLANK vs 0)',
    ],
    causes: [
      'Chybějící data ve zdrojovém souboru',
      'Výpočty na prázdných buňkách',
      'Záznamy bez odpovídajícího záznamu v propojené tabulce (neexistující FK)',
    ],
    solutions: [
      {
        title: 'Nahraď BLANK nulou nebo výchozí hodnotou',
        content: 'Použij IF, COALESCE nebo +0 pro nahrazení BLANK.',
        code: '-- Nahrazení BLANK nulou:\nHodnota = IF(ISBLANK([MojeHodnota]), 0, [MojeHodnota])\n\n-- Jednodušeji pomocí +0:\nHodnota = [MojeHodnota] + 0\n\n-- Pomocí COALESCE (Power BI 2020+):\nHodnota = COALESCE([MojeHodnota], 0)\n\n-- V Power Query - nahraď null:\n= Table.ReplaceValue(Zdroj, null, 0, Replacer.ReplaceValue, {"Sloupec"})',
      },
      {
        title: 'Filtruj nebo skryj BLANK v sestavě',
        content: 'V panelu filtru nastav "není prázdná" nebo v nastavení vizuálu zapni "Zobrazit položky bez dat".',
        code: '-- DAX filtr na nenulové hodnoty:\nMíraOdfiltrováno = CALCULATE(\n    [MojeMíra],\n    NOT ISBLANK(Tabulka[Sloupec])\n)',
      },
    ],
  },
  {
    id: 'relationship-error',
    title: 'Relationship Error (Chyba relace)',
    category: 'Relace',
    severity: 'error',
    description: 'Různé chyby při vytváření nebo používání relací – nekompatibilní typy, duplicity, NULL hodnoty.',
    symptoms: [
      'Power BI odmítá vytvořit relaci',
      'Data se nepropagují správně přes relaci',
      'Výsledky ve vizuálech jsou nesprávné nebo prázdné',
    ],
    causes: [
      'Propojené sloupce mají různé datové typy',
      'Sloupec na straně "1" v relaci 1:N obsahuje duplicity',
      'NULL nebo BLANK hodnoty v klíčovém sloupci',
    ],
    solutions: [
      {
        title: 'Sjednoť datové typy',
        content: 'Propojené sloupce musí mít stejný typ. Oba Text, oba Číslo, nebo oba Datum.',
        code: '-- V Power Query - změna typu:\n= Table.TransformColumnTypes(Zdroj, {{"IDSloupec", type text}})',
      },
      {
        title: 'Odstraň duplicity v klíčovém sloupci',
        content: 'Sloupec na straně "1" nesmí mít duplicitní hodnoty.',
        code: '-- Odstranění duplicit v Power Query:\n= Table.Distinct(Zdroj, {"ZákazníkID"})',
      },
      {
        title: 'Ošetři NULL hodnoty',
        content: 'NULL hodnoty v klíčovém sloupci mohou způsobit problémy s propojením.',
        code: '-- Nahrazení NULL prázdným řetězcem:\n= Table.ReplaceValue(Zdroj, null, "Neznámý", Replacer.ReplaceValue, {"IDSloupec"})',
      },
    ],
  },
  {
    id: 'incorrect-syntax',
    title: 'Incorrect Syntax (Nesprávná syntaxe DAX)',
    category: 'DAX',
    severity: 'error',
    description: 'Syntaktická chyba v DAX výrazu zabrání jeho vyhodnocení. Nejčastěji chybějící závorky, špatné uvozovky nebo překlepy.',
    symptoms: [
      'Červené podtržení nebo X v řádku vzorců',
      'Chybová zpráva "Syntax error" nebo "Unexpected token"',
      'Výraz nelze uložit',
    ],
    causes: [
      'Chybějící nebo přebytečná závorka',
      'Jednoduché místo dvojitých uvozovek u textových hodnot',
      'Překlepy v názvech funkcí (CALSULATE místo CALCULATE)',
      'Odkaz na sloupec bez tabulky (Tržba místo Objednávky[Tržba])',
    ],
    solutions: [
      {
        title: 'Zkontroluj závorky',
        content: 'Každá ( musí mít své ). IntelliSense v Power BI je závorky barevně odlišuje.',
        code: '-- Špatně:\nVýsledek = IF(Tabulka[Hodnota] > 0, "Ano", "Ne"\n                                              ↑ chybí závorka\n\n-- Správně:\nVýsledek = IF(Tabulka[Hodnota] > 0, "Ano", "Ne")',
      },
      {
        title: 'Použij dvojité uvozovky pro text',
        content: 'DAX používá pro textové hodnoty výhradně dvojité uvozovky, nikdy jednoduché.',
        code: "-- Špatně (jednoduchá uvozovka):\nVýsledek = IF(Tabulka[Typ] = 'A', 'Ano', 'Ne')\n\n-- Správně (dvojitá uvozovka):\nVýsledek = IF(Tabulka[Typ] = \"A\", \"Ano\", \"Ne\")",
      },
      {
        title: 'Vždy uváděj tabulku u sloupce',
        content: 'DAX vyžaduje plný odkaz: Tabulka[Sloupec]. Samotné [Sloupec] bez tabulky nefunguje všude.',
        code: '-- Špatně:\nVýsledek = SUM([Tržba])\n\n-- Správně:\nVýsledek = SUM(Objednávky[Tržba])',
      },
    ],
  },
  {
    id: 'division-by-zero',
    title: 'Division by Zero (Dělení nulou)',
    category: 'DAX',
    severity: 'warning',
    description: 'Pokus o dělení nulou v DAX vrátí chybu nebo BLANK, místo očekávaného výsledku.',
    symptoms: [
      'Vizuál zobrazuje chybu nebo prázdnou hodnotu',
      'Hodnota "Infinity" nebo "#DIV/0!" ve výsledku',
      'Neočekávané BLANK hodnoty v procentuálních výpočtech',
    ],
    causes: [
      'Přímé dělení / kde jmenovatel může být nula nebo BLANK',
      'Procento z celku bez ošetření nulového jmenovatele',
      'Výpočty na filtrech, kde jsou data prázdná',
    ],
    solutions: [
      {
        title: 'Vždy používej funkci DIVIDE',
        content: 'Funkce DIVIDE automaticky ošetří dělení nulou a vrátí alternativní hodnotu (výchozí BLANK nebo tvou hodnotu).',
        code: '-- Špatně - může způsobit chybu:\nProcento = Tabulka[Hodnota] / Tabulka[Celkem]\n\n-- Správně - DIVIDE ošetří dělení nulou:\nProcento = DIVIDE(Tabulka[Hodnota], Tabulka[Celkem])\n\n-- S vlastní alternativní hodnotou:\nProcento = DIVIDE(Tabulka[Hodnota], Tabulka[Celkem], 0)',
      },
      {
        title: 'Ošetři pomocí IF',
        content: 'Zkontroluj jmenovatel před dělením – méně elegantní, ale přehledné.',
        code: 'Procento = IF(\n    Tabulka[Celkem] = 0 || ISBLANK(Tabulka[Celkem]),\n    0,\n    Tabulka[Hodnota] / Tabulka[Celkem]\n)',
      },
    ],
  },
  {
    id: 'context-transition',
    title: 'Context Transition (Přechod kontextu)',
    category: 'DAX',
    severity: 'info',
    description: 'CALCULATE uvnitř iterátoru (SUMX, FILTER) automaticky převede kontext řádků na kontext filtru. Toto chování může být nečekané.',
    symptoms: [
      'Míra vrací jiné hodnoty uvnitř SUMX než mimo ni',
      'Výpočty jsou správné v kartě, ale špatné v tabulce',
      'Výsledky se mění v závislosti na umístění v sestavě',
    ],
    causes: [
      'CALCULATE uvnitř SUMX nebo FILTER',
      'Míra odkazující na jinou míru uvnitř iterátoru',
      'Vypočítaný sloupec vs. míra – různé kontexty',
    ],
    solutions: [
      {
        title: 'Pochop rozdíl kontextů',
        content: 'Kontext řádku: existuje v iterátorech (SUMX, FILTER, ADDCOLUMNS) a vypočítaných sloupcích – "v jaké řádce jsem". Kontext filtru: co je aktuálně filtrováno v sestavě.',
        code: '-- Context transition: CALCULATE převede řádkový → filtrový kontext\nVýsledek = SUMX(\n    Zákazníci,\n    -- Zde existuje kontext řádku (aktuální zákazník)\n    CALCULATE([CelkovéTržby])  -- přechod: filtruje jen pro tohoto zákazníka\n)',
      },
      {
        title: 'Používej odkaz na sloupec místo míry v iterátorech',
        content: 'Pokud nepotřebuješ context transition, odkaz přímo na sloupec místo míry.',
        code: '-- Potenciálně pomalé (context transition pro každý řádek):\nVýsledek = SUMX(Objednávky, [CenaZaMíru])\n\n-- Rychlejší (přímý výpočet na sloupcích):\nVýsledek = SUMX(Objednávky, Objednávky[Množství] * Objednávky[Cena])',
      },
    ],
  },
  {
    id: 'type-mismatch',
    title: 'Type Mismatch (Nesprávný datový typ)',
    category: 'Data',
    severity: 'error',
    description: 'Operace s nekompatibilními datovými typy způsobí chyby nebo nesprávné výsledky.',
    symptoms: [
      'Chyba "Cannot convert value..." nebo "Type mismatch"',
      'Sloupec zobrazuje chybové hodnoty',
      'Data se nenačítají správně z Power Query',
    ],
    causes: [
      'Text místo čísla v číselném sloupci (mezera, pomlčka)',
      'Datum ve špatném formátu (DD.MM.YYYY vs. MM/DD/YYYY)',
      'Smíšené typy dat v jednom sloupci',
    ],
    solutions: [
      {
        title: 'Oprav datové typy v Power Query',
        content: 'Power Query je nejlepší místo pro opravu typů – klikni na ikonu datového typu v záhlaví sloupce.',
        code: '-- Změna typů více sloupců najednou:\n= Table.TransformColumnTypes(Zdroj, {\n    {"Datum",   type date},\n    {"Hodnota", type number},\n    {"Název",   type text}\n})',
      },
      {
        title: 'Konverze typů v DAX',
        content: 'Pokud musíš konvertovat v DAX, použij vestavěné funkce.',
        code: '-- Text na číslo:\nČísloHodnota = VALUE(Tabulka[TextHodnota])\n-- nebo:\nČísloHodnota = INT(Tabulka[TextHodnota])\n\n-- Číslo nebo datum na text:\nTextHodnota = FORMAT(Tabulka[Datum], "DD.MM.YYYY")\nTextČísla  = FORMAT(Tabulka[Číslo], "#,##0.00")\n\n-- Text na datum:\nDatumHodnota = DATEVALUE(Tabulka[TextDatum])',
      },
    ],
  },
];

export const severityConfig = {
  error:   { label: 'Chyba',    color: 'text-red-400 bg-red-400/10 border-red-400/20',     icon: '🔴' },
  warning: { label: 'Varování', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: '🟡' },
  info:    { label: 'Info',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   icon: '🔵' },
};
