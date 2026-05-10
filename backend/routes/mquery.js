const express = require('express');
const router = express.Router();

const generators = {
  'filter-equals': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] = "${p.value || 'Hodnota'}")\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky z tabulky **${t}**, kde sloupec **${c}** se rovná hodnotě "${p.value || 'Hodnota'}".`,
    notes: 'Pro číselné hodnoty odstraň uvozovky: each [Sloupec] = 100'
  }),
  'filter-greater': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] > ${p.value || '0'})\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde sloupec **${c}** je větší než **${p.value || '0'}**.`,
    notes: 'Pro >= použij >= místo >'
  }),
  'filter-less': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each [${c}] < ${p.value || '0'})\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde sloupec **${c}** je menší než **${p.value || '0'}**.`,
    notes: 'Pro <= použij <= místo <'
  }),
  'filter-contains': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Filtrováno = Table.SelectRows(Zdroj, each Text.Contains([${c}], "${p.value || 'text'}"))\nin\n    Filtrováno`,
    explanation: `Vyfiltruje řádky, kde sloupec **${c}** obsahuje text "${p.value || 'text'}".`,
    notes: 'Rozlišuje velká a malá písmena. Pro case-insensitive: Text.Contains([Sloupec], "text", Comparer.OrdinalIgnoreCase)'
  }),
  'filter-not-null': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnoNull = Table.SelectRows(Zdroj, each [${c}] <> null)\nin\n    OdstraněnoNull`,
    explanation: `Odstraní řádky, kde sloupec **${c}** je null (prázdný).`,
    notes: 'Pro odstranění null ze všech sloupců: Table.SelectRows(Zdroj, each not List.AnyTrue(List.Transform(Record.ToList(_), each _ = null)))'
  }),
  'remove-column': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnýSloupec = Table.RemoveColumns(Zdroj, {"${c}"})\nin\n    OdstraněnýSloupec`,
    explanation: `Odstraní sloupec **${c}** z tabulky **${t}**.`,
    notes: 'Pro odebrání více sloupců: Table.RemoveColumns(Zdroj, {"Sloupec1", "Sloupec2"})'
  }),
  'rename-column': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    PřejmenovanýSloupec = Table.RenameColumns(Zdroj, {{"${c}", "${p.newName || 'NovýNázev'"}})\nin\n    PřejmenovanýSloupec`,
    explanation: `Přejmenuje sloupec **${c}** na **${p.newName || 'NovýNázev'}** v tabulce **${t}**.`,
    notes: 'Pro přejmenování více sloupců přidej další páry: {{"Starý1","Nový1"}, {"Starý2","Nový2"}}'
  }),
  'change-type-text': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type text}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Text**.`,
    notes: 'Ujisti se, že hodnoty lze převést na text (většina hodnot lze)'
  }),
  'change-type-number': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type number}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Číslo (Decimal)**. Hodnoty, které nelze převést, budou null.`,
    notes: 'Pro celé číslo: type Int64.Type; pro decimal: type number'
  }),
  'change-type-date': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    ZměněnýTyp = Table.TransformColumnTypes(Zdroj, {{"${c}", type date}})\nin\n    ZměněnýTyp`,
    explanation: `Změní datový typ sloupce **${c}** na **Datum**.`,
    notes: 'Formát data musí být rozpoznatelný. Pro datetime: type datetime'
  }),
  'add-column': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    PřidanýSloupec = Table.AddColumn(Zdroj, "${p.newName || 'NovýSloupec'}", each [${c}] * 2, type number)\nin\n    PřidanýSloupec`,
    explanation: `Přidá nový sloupec **${p.newName || 'NovýSloupec'}** s výpočtem z hodnot sloupce **${c}**. Uprav výraz \`each [...]\` podle potřeby.`,
    notes: 'Třetí argument je typ: type text, type number, type date apod.'
  }),
  'group-by': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    Seskupeno = Table.Group(Zdroj, {"${c}"}, {\n        {"Součet", each List.Sum([${p.aggColumn || c}]), type number},\n        {"Počet", each Table.RowCount(_), type number}\n    })\nin\n    Seskupeno`,
    explanation: `Seskupí tabulku **${t}** podle sloupce **${c}** a vypočítá součet a počet záznamů pro každou skupinu.`,
    notes: 'Nahraď List.Sum() za List.Average(), List.Max(), List.Min() dle potřeby'
  }),
  'sort-asc': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Seřazeno = Table.Sort(Zdroj, {{"${c}", Order.Ascending}})\nin\n    Seřazeno`,
    explanation: `Seřadí tabulku **${t}** podle sloupce **${c}** vzestupně (A→Z, 1→9).`,
    notes: 'Pro více sloupců: {{"Sloupec1", Order.Ascending}, {"Sloupec2", Order.Descending}}'
  }),
  'sort-desc': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Seřazeno = Table.Sort(Zdroj, {{"${c}", Order.Descending}})\nin\n    Seřazeno`,
    explanation: `Seřadí tabulku **${t}** podle sloupce **${c}** sestupně (Z→A, 9→1).`,
    notes: 'Pro více sloupců: {{"Sloupec1", Order.Descending}, {"Sloupec2", Order.Ascending}}'
  }),
  'remove-duplicates': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    OdstraněnéDuplikáty = Table.Distinct(Zdroj, {"${c}"})\nin\n    OdstraněnéDuplikáty`,
    explanation: `Odstraní duplicitní řádky z tabulky **${t}** podle sloupce **${c}**. Zachová první výskyt každé hodnoty.`,
    notes: 'Pro deduplikaci podle více sloupců: {"Sloupec1", "Sloupec2"}'
  }),
  'replace-value': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    NahrazenáHodnota = Table.ReplaceValue(\n        Zdroj,\n        "${p.oldValue || 'StaráHodnota'}",\n        "${p.newValue || 'NováHodnota'}",\n        Replacer.ReplaceValue,\n        {"${c}"}\n    )\nin\n    NahrazenáHodnota`,
    explanation: `Nahradí všechny výskyty "${p.oldValue || 'StaráHodnota'}" za "${p.newValue || 'NováHodnota'}" ve sloupci **${c}** tabulky **${t}**.`,
    notes: 'Replacer.ReplaceText nahrazuje část textu; Replacer.ReplaceValue nahrazuje celou buňku'
  }),
  'split-column': (t, c, p) => ({
    code: `let\n    Zdroj = ${t},\n    RozdělenýSloupec = Table.SplitColumn(\n        Zdroj,\n        "${c}",\n        Splitter.SplitTextByDelimiter("${p.delimiter || ','}"),\n        {"${c}.1", "${c}.2"}\n    )\nin\n    RozdělenýSloupec`,
    explanation: `Rozdělí sloupec **${c}** tabulky **${t}** podle oddělovače "${p.delimiter || ','}". Výsledkem jsou nové sloupce ${c}.1 a ${c}.2.`,
    notes: 'Uprav počet výsledných sloupců v posledním argumentu'
  }),
  'fill-down': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    VyplněnoDolů = Table.FillDown(Zdroj, {"${c}"})\nin\n    VyplněnoDolů`,
    explanation: `Vyplní prázdné (null) buňky ve sloupci **${c}** hodnotou z předchozího neprázdného řádku.`,
    notes: 'Table.FillUp funguje opačně (vyplňuje nahoru)'
  }),
  'unpivot': (t, c, _p) => ({
    code: `let\n    Zdroj = ${t},\n    Unpivot = Table.UnpivotOtherColumns(\n        Zdroj,\n        {"${c}"},\n        "Atribut",\n        "Hodnota"\n    )\nin\n    Unpivot`,
    explanation: `Převede všechny sloupce KROMĚ **${c}** z širokého formátu na dlouhý (Atribut/Hodnota páry). Vhodné pro normalizaci dat.`,
    notes: 'Pro unpivot konkrétních sloupců: Table.Unpivot(Zdroj, {"Sloupec1","Sloupec2"}, "Atribut", "Hodnota")'
  })
};

router.post('/generate', (req, res) => {
  const { tableName, columnName, operation, params = {} } = req.body;
  if (!tableName || !columnName || !operation) {
    return res.status(400).json({ error: 'Chybí: tableName, columnName nebo operation.' });
  }

  const gen = generators[operation];
  if (!gen) {
    return res.status(400).json({ error: `Neznámá operace: ${operation}` });
  }

  const result = gen(tableName.trim(), columnName.trim(), params);
  res.json({ success: true, result: { ...result, input: { tableName, columnName, operation }, timestamp: new Date().toISOString() } });
});

module.exports = router;
