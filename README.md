# Power BI Průvodce & Generátor

Moderní webová aplikace pro pomoc s Power BI – návody, generátor DAX, Power Query M, interaktivní průvodce a databáze chyb. Celá v češtině.

## Funkce

- **Návody** – krok za krokem s ukázkami kódu
- **Generátor DAX** – popiš výpočet, dostaneš výraz s vysvětlením
- **Power Query M** – 18+ operací pro transformaci dat
- **Interaktivní průvodce** – wizard, který doporučí postup a kód
- **Chyby & Tipy** – databáze nejčastějších chyb s řešeními
- **Historie** – ukládá generované výrazy, možnost exportu
- **Dark mode** & responzivní design

## Spuštění

### 1. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Aplikace poběží na: **http://localhost:5173**

### 2. Backend (Node.js + Express) – volitelné

Backend poskytuje REST API. Frontend funguje i bez něj (data jsou embedded).

```bash
cd backend
npm install
npm run dev
```

API poběží na: **http://localhost:3001**

API endpoint: `GET http://localhost:3001/api/health`

## Struktura projektu

```
Power Bi návod/
├── frontend/                  # React + Vite aplikace
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, Header, CodeBlock, Toast
│   │   ├── pages/             # Home, Tutorials, DaxGenerator, PowerQueryGenerator,
│   │   │                      # InteractiveGuide, ErrorsDatabase, History
│   │   ├── context/           # AppContext (history, favorites, toasts)
│   │   ├── data/              # tutorials.js, errors.js (veškerá data)
│   │   ├── utils/             # generators.js (DAX a M generátory)
│   │   └── hooks/             # useLocalStorage.js
│   └── package.json
├── backend/                   # Express API (volitelné)
│   ├── routes/                # dax.js, mquery.js, tutorials.js, errors.js
│   ├── data/                  # tutorials.json, errors.json
│   └── package.json
└── README.md
```

## Technologie

| Vrstva    | Technologie                            |
|-----------|----------------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS 3       |
| Routing   | React Router v6                        |
| Ikony     | Lucide React                           |
| Zvýraznění kódu | react-syntax-highlighter        |
| Backend   | Node.js, Express 4                     |
| Persistence | localStorage (history, favorites)   |
