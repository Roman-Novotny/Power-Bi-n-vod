import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Sparkles, Wrench, Map,
  AlertTriangle, Clock, Star, ChevronRight, BarChart2
} from 'lucide-react';

const nav = [
  { to: '/',         icon: Home,          label: 'Domů',           end: true },
  { to: '/tutorials',icon: BookOpen,       label: 'Návody' },
  { to: '/dax',      icon: Sparkles,       label: 'Generátor DAX' },
  { to: '/mquery',   icon: Wrench,         label: 'Power Query M' },
  { to: '/guide',    icon: Map,            label: 'Průvodce' },
  { to: '/errors',       icon: AlertTriangle,  label: 'Chyby & Tipy' },
  { to: '/chart-advisor', icon: BarChart2,      label: 'Průvodce grafy' },
];

const bottom = [
  { to: '/favorites', icon: Star,  label: 'Oblíbené' },
  { to: '/history',   icon: Clock, label: 'Historie' },
];

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          w-64 bg-bg-secondary border-r border-white/5
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-white font-bold text-sm">PB</span>
            </div>
            <div>
              <p className="font-semibold text-gray-100 text-sm leading-tight">Power BI</p>
              <p className="text-xs text-gray-500 leading-tight">Průvodce & Generátor</p>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Navigace</p>
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-brand-400/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
          {bottom.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <div className="px-3 pt-3">
            <div className="text-[10px] text-gray-600 leading-relaxed">
              Power BI Průvodce v1.0<br />
              Česká republika 🇨🇿
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
