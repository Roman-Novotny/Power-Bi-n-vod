import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Wrench, Map, AlertTriangle, ArrowRight, Zap, Star } from 'lucide-react';
import { tutorials, categories } from '../data/tutorials';

const features = [
  {
    to: '/tutorials',
    icon: BookOpen,
    title: 'Interaktivní návody',
    desc: 'Krok za krokem – od propojení tabulek až po YTD výpočty.',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    border: 'hover:border-blue-500/30',
    count: `${tutorials.length} návodů`,
  },
  {
    to: '/dax',
    icon: Sparkles,
    title: 'Generátor DAX',
    desc: 'Popiš, co chceš vypočítat – aplikace vygeneruje DAX výraz s vysvětlením.',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    border: 'hover:border-purple-500/30',
    count: '14+ šablon',
  },
  {
    to: '/mquery',
    icon: Wrench,
    title: 'Power Query M',
    desc: 'Generuj M kód pro filtrování, transformaci a čištění dat.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    border: 'hover:border-emerald-500/30',
    count: '18+ operací',
  },
  {
    to: '/guide',
    icon: Map,
    title: 'Interaktivní průvodce',
    desc: 'Odpovídej na otázky – aplikace doporučí postup a vygeneruje kód.',
    color: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    border: 'hover:border-cyan-500/30',
    count: 'Krok za krokem',
  },
  {
    to: '/errors',
    icon: AlertTriangle,
    title: 'Chyby & Tipy',
    desc: 'Nejčastější chyby v Power BI s vysvětlením příčin a řešení.',
    color: 'from-yellow-500/20 to-yellow-600/5',
    iconColor: 'text-yellow-400',
    border: 'hover:border-yellow-500/30',
    count: '8+ chyb',
  },
];

const quickLinks = [
  { label: 'Jak propojit tabulky',         to: '/tutorials/propojeni-tabulek' },
  { label: 'Jak vytvořit datumovou tabulku',to: '/tutorials/datumova-tabulka' },
  { label: 'Jak funguje CALCULATE',         to: '/tutorials/calculate-funkce' },
  { label: 'Jak udělat YTD',               to: '/tutorials/ytd-vypocet' },
  { label: 'Circular Dependency',           to: '/errors' },
  { label: 'Generuj DAX výraz',            to: '/dax' },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-bg-card p-8 md:p-12 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium mb-5">
            <Zap size={12} />
            Power BI průvodce v češtině
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-100 mb-4 leading-tight">
            Nauč se Power BI<br />
            <span className="gradient-text">rychle a snadno</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mb-8 leading-relaxed">
            Interaktivní průvodce pro začátečníky i pokročilé. Generuj DAX výrazy,
            M kód a procházej detailní návody – vše v češtině.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/tutorials" className="btn-primary text-sm px-5 py-2.5">
              <BookOpen size={16} />
              Prohlédnout návody
              <ArrowRight size={15} />
            </Link>
            <Link to="/dax" className="btn-secondary text-sm px-5 py-2.5">
              <Sparkles size={16} />
              Generátor DAX
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="section-title flex items-center gap-2">
          <Star size={18} className="text-yellow-400" />
          Rychlý přístup
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/3 text-sm text-gray-400 hover:text-gray-100 hover:border-white/20 hover:bg-white/5 transition-all duration-150"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="section-title">Co aplikace umí</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <Link
              key={f.to}
              to={f.to}
              className={`card p-5 group cursor-pointer border ${f.border} transition-all duration-200`}
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${f.color} mb-4 group-hover:scale-105 transition-transform duration-200`}>
                <f.icon size={22} className={f.iconColor} />
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-100 text-sm leading-snug">{f.title}</h3>
                <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap bg-white/5 px-2 py-0.5 rounded-full">{f.count}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                Otevřít <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="section-title">Kategorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/tutorials?cat=${cat.id}`}
              className="card p-4 text-center group hover:border-brand-500/30 cursor-pointer"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors font-medium leading-snug">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent tutorials */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Nedávné návody</h2>
          <Link to="/tutorials" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Všechny <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {tutorials.slice(0, 5).map(t => (
            <Link
              key={t.id}
              to={`/tutorials/${t.id}`}
              className="flex items-center gap-4 p-4 card group hover:border-white/10 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors truncate">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.category} · {t.duration}</p>
              </div>
              <span className={`badge text-[11px] ${
                t.difficulty === 'Začátečník' ? 'text-emerald-400 bg-emerald-400/10' :
                t.difficulty === 'Střední'    ? 'text-yellow-400 bg-yellow-400/10' :
                                               'text-red-400 bg-red-400/10'
              }`}>
                {t.difficulty}
              </span>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
