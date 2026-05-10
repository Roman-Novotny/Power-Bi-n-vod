const express = require('express');
const router = express.Router();

// Databáze DAX šablon
const templates = {
  sum: {
    keys: ['součet','suma','celkem','total','sum','sečti','sečíst','sumu'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Celkem'} = SUM(${t}[${c}])`,
      explanation: `Spočítá součet všech číselných hodnot ve sloupci **${c}** v tabulce **${t}**. BLANK hodnoty jsou automaticky ignorovány.`,
      syntax: 'SUM(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje pouze s číselnými sloupci', 'Pro výpočty na řádku použij SUMX']
    })
  },
  average: {
    keys: ['průměr','average','avg','střední hodnota','průměrný'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Průměr'} = AVERAGE(${t}[${c}])`,
      explanation: `Vypočítá aritmetický průměr hodnot ve sloupci **${c}**. BLANK hodnoty jsou ignorovány (neovlivní výsledek).`,
      syntax: 'AVERAGE(<sloupec>)',
      category: 'Agregace',
      tips: ['Pro vážený průměr použij SUMX / COUNT', 'BLANK není totéž co 0 – nula průměr ovlivní']
    })
  },
  count: {
    keys: ['počet','kolik','count','countrows','záznamy','řádků','záznamů'],
    gen: (t, c, alias) => ({
      code: `${alias || 'PočetZáznamů'} = COUNTROWS(${t})`,
      explanation: `Spočítá celkový počet řádků v tabulce **${t}**. Pokud chceš počítat pouze neprázdné hodnoty ve sloupci, použij COUNT(${t}[${c}]).`,
      syntax: 'COUNTROWS(<tabulka>)\nCOUNT(<sloupec>)',
      category: 'Agregace',
      tips: ['COUNTROWS počítá všechny řádky', 'COUNT ignoruje BLANK hodnoty', 'COUNTA počítá i textové hodnoty']
    })
  },
  distinctcount: {
    keys: ['unikátní','distinct','unique','různých','jedineční','odlišných'],
    gen: (t, c, alias) => ({
      code: `${alias || 'Unikátní' + c} = DISTINCTCOUNT(${t}[${c}])`,
      explanation: `Spočítá počet jedinečných hodnot ve sloupci **${c}** tabulky **${t}**. Duplicitní hodnoty se počítají pouze jednou.`,
      syntax: 'DISTINCTCOUNT(<sloupec>)',
      category: 'Agregace',
      tips: ['Vhodné pro počítání zákazníků, produktů apod.', 'BLANK je považován za jednu unikátní hodnotu']
    })
  },
  max: {
    keys: ['maximum','nejvyšší','max','největší','maximum'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Max'} = MAX(${t}[${c}])`,
      explanation: `Vrátí nejvyšší hodnotu ve sloupci **${c}** tabulky **${t}**.`,
      syntax: 'MAX(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje i s daty (vrátí nejpozdější datum)', 'Pro text vrátí poslední písmeno abecedy']
    })
  },
  min: {
    keys: ['minimum','nejnižší','min','nejmenší'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Min'} = MIN(${t}[${c}])`,
      explanation: `Vrátí nejnižší hodnotu ve sloupci **${c}** tabulky **${t}**.`,
      syntax: 'MIN(<sloupec>)',
      category: 'Agregace',
      tips: ['Funguje i s daty (vrátí nejstarší datum)']
    })
  },
  ytd: {
    keys: ['ytd','year to date','od začátku roku','kumulativní rok','roční kumulace'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'YTD'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    DATESYTD(Datum[Datum])\n)`,
      explanation: `Vypočítá kumulativní součet sloupce **${c}** od 1. ledna do aktuálního data v kontextu. Vyžaduje tabulku **Datum** označenou jako datumová tabulka.`,
      syntax: 'CALCULATE(<výraz>, DATESYTD(<datum_sloupec>))',
      category: 'Časová inteligence',
      tips: ['Musí existovat propojená datumová tabulka', 'Pro fiskální rok: DATESYTD(Datum[Datum], "3-31")', 'MTD: DATESMTD(), QTD: DATESQTD()']
    })
  },
  lastyear: {
    keys: ['předchozí rok','minulý rok','loni','last year','pytd','prior year','stejné období loni'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'MinulýRok'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    SAMEPERIODLASTYEAR(Datum[Datum])\n)`,
      explanation: `Vrátí součet sloupce **${c}** za stejné období minulého roku. Ideální pro meziroční srovnání (Year-over-Year).`,
      syntax: 'CALCULATE(<výraz>, SAMEPERIODLASTYEAR(<datum_sloupec>))',
      category: 'Časová inteligence',
      tips: ['Kombinuj s YTD pro PYTD metriky', 'Pro vlastní posun v čase: DATEADD(Datum[Datum], -1, YEAR)']
    })
  },
  percent: {
    keys: ['procento','podíl','percent','percentage','%','procentuální','share'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Procento'} =\nDIVIDE(\n    SUM(${t}[${c}]),\n    CALCULATE(\n        SUM(${t}[${c}]),\n        ALL(${t})\n    )\n)`,
      explanation: `Vypočítá procentuální podíl aktuálního kontextu na celkovém součtu (ignoruje všechny filtry pomocí ALL). Výsledek je desetinné číslo – formátuj jako procenta.`,
      syntax: 'DIVIDE(<čitatel>, <jmenovatel>, [<při_dělení_nulou>])',
      category: 'Matematika',
      tips: ['DIVIDE automaticky ošetří dělení nulou', 'Nastav formát sloupce na procenta', 'Pro procento v rámci kategorie: ALLEXCEPT(Tabulka, Sloupec)']
    })
  },
  if_cond: {
    keys: ['podmínka','pokud','když','if','switch','případ','větší než','menší než'],
    gen: (t, c, alias) => ({
      code: `${alias || 'Kategorie'} =\nIF(\n    ${t}[${c}] > 0,\n    "Kladné",\n    IF(\n        ${t}[${c}] = 0,\n        "Nula",\n        "Záporné"\n    )\n)`,
      explanation: `Podmíněné vyhodnocení sloupce **${c}**. IF(podmínka, hodnota_pokud_pravda, hodnota_pokud_nepravda). Funkce IF lze vnořovat. Pro více podmínek je přehlednější SWITCH.`,
      syntax: 'IF(<podmínka>, <pokud_pravda>, [<pokud_nepravda>])',
      category: 'Logika',
      tips: ['Pro více podmínek použij SWITCH(TRUE(), ...)', 'Prázdná hodnota "nepravda" vrátí BLANK', 'AND() a OR() pro kombinaci podmínek']
    })
  },
  rank: {
    keys: ['pořadí','rank','ranking','seřadit','žebříček','rankx'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Pořadí'} =\nRANKX(\n    ALL(${t}),\n    [${c}Celkem],,\n    DESC,\n    Dense\n)`,
      explanation: `Přiřadí pořadí záznamu v rámci celé tabulky **${t}** podle hodnoty míry **${c}Celkem** od největšího (DESC). "Dense" znamená bez mezer v pořadí při shodě.`,
      syntax: 'RANKX(<tabulka>, <výraz>, [<hodnota>], [<pořadí>], [<vazby>])',
      category: 'Statistika',
      tips: ['ALL() zajistí pořadí bez filtrů', 'ASC = vzestupně, DESC = sestupně', 'Dense = bez mezer, Skip = s mezerami při shodě']
    })
  },
  runningtotal: {
    keys: ['průběžný součet','running total','kumulativní součet','running sum','kumulace'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Kumulativní'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    FILTER(\n        ALL(Datum[Datum]),\n        Datum[Datum] <= MAX(Datum[Datum])\n    )\n)`,
      explanation: `Vypočítá průběžný kumulativní součet sloupce **${c}** přes čas. Pro každé datum sečte vše od začátku až do tohoto data.`,
      syntax: 'CALCULATE(SUM(...), FILTER(ALL(Datum[Datum]), ...))',
      category: 'Časová inteligence',
      tips: ['Vyžaduje datumovou tabulku', 'Ujisti se, že Datum[Datum] je správně propojeno']
    })
  },
  calculate: {
    keys: ['calculate','filtrovaný','s filtrem','podmíněný výpočet','filtr na míru'],
    gen: (t, c, alias) => ({
      code: `${alias || 'FiltrovanýSoučet'} =\nCALCULATE(\n    SUM(${t}[${c}]),\n    ${t}[Kategorie] = "Hodnota"\n)`,
      explanation: `CALCULATE je nejdůležitější funkce v DAX. Vyhodnotí první argument (výraz) v modifikovaném kontextu filtru definovaném dalšími argumenty. Nahraď "Hodnota" svou hodnotou.`,
      syntax: 'CALCULATE(<výraz>, [<filtr1>], [<filtr2>], ...)',
      category: 'Filtr',
      tips: ['Filtry jsou spojeny operátorem AND', 'Pro OR použij funkci IN nebo OR()', 'ALL(), FILTER() a ALLEXCEPT() jsou běžné filtry']
    })
  },
  sumx: {
    keys: ['sumx','iterace','násobení','výpočet na řádku','součin'],
    gen: (t, c, alias) => ({
      code: `${alias || 'VýsledekSUMX'} =\nSUMX(\n    ${t},\n    ${t}[${c}] * ${t}[Množství]\n)`,
      explanation: `SUMX iteruje přes každý řádek tabulky **${t}** a pro každý řádek vypočítá **${c} × Množství**, poté vše sečte. Uprav výraz pro svůj konkrétní výpočet.`,
      syntax: 'SUMX(<tabulka>, <výraz_pro_každý_řádek>)',
      category: 'Iterátoři',
      tips: ['Výkonnostně náročnější než SUM', 'Používej pouze když potřebuješ výpočet na úrovni řádku', 'AVERAGEX, MINX, MAXX fungují analogicky']
    })
  },
  divide: {
    keys: ['dělit','dělení','divide','podíl čísel','poměr'],
    gen: (t, c, alias) => ({
      code: `${alias || c + 'Podíl'} =\nDIVIDE(\n    SUM(${t}[${c}]),\n    SUM(${t}[Jmenovatel]),\n    0\n)`,
      explanation: `Bezpečné dělení – pokud je jmenovatel 0 nebo BLANK, vrátí alternativní hodnotu (zde 0) místo chyby. Nahraď "Jmenovatel" názvem svého sloupce.`,
      syntax: 'DIVIDE(<čitatel>, <jmenovatel>, [<alternativní_výsledek>])',
      category: 'Matematika',
      tips: ['Vždy preferuj DIVIDE před přímým /','Třetí argument je volitelný (default = BLANK)']
    })
  }
};

const match = (desc, keys) => {
  const d = desc.toLowerCase();
  return keys.some(k => d.includes(k));
};

router.post('/generate', (req, res) => {
  const { description, tableName, columnName, measureName } = req.body;
  if (!description || !tableName || !columnName) {
    return res.status(400).json({ error: 'Chybí povinné pole: description, tableName nebo columnName.' });
  }

  let result = null;
  for (const tpl of Object.values(templates)) {
    if (match(description, tpl.keys)) {
      result = tpl.gen(tableName.trim(), columnName.trim(), measureName?.trim() || null);
      break;
    }
  }
  if (!result) {
    result = templates.sum.gen(tableName.trim(), columnName.trim(), measureName?.trim() || null);
  }

  res.json({ success: true, result: { ...result, input: { description, tableName, columnName }, timestamp: new Date().toISOString() } });
});

module.exports = router;
