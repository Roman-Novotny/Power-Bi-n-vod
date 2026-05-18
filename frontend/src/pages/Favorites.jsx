import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, ArrowRight, Heart } from 'lucide-react';
import { tutorials, difficultyColors } from '../data/tutorials';
import { useApp } from '../context/AppContext';

export default function Favorites() {
  const { favorites, toggleFavorite, addToast } = useApp();
  const favTutorials = tutorials.filter(t => favorites.includes(t.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Star size={22} className="text-yellow-400 fill-yellow-400" />
          Oblíbené návody
        </h1>
        <p className="text-gray-400 text-sm mt-1">Tvoje uložené návody pro rychlý přístup</p>
      </div>

      {favTutorials.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart size={40} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium mb-2">Zatím žádné oblíbené</p>
          <p className="text-gray-600 text-sm mb-6">
            Klikni na hvězdičku <Star size={13} className="inline text-gray-500" /> u libovolného návodu – uloží se sem.
          </p>
          <Link to="/tutorials" className="btn-primary inline-flex justify-center">
            <BookOpen size={16} /> Procházet návody
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{favTutorials.length} oblíbených</p>
          <div className="space-y-3">
            {favTutorials.map(t => (
              <div key={t.id} className="card p-5 flex gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap mb-2">
                    <Link
                      to={`/tutorials/${t.id}`}
                      className="text-base font-semibold text-gray-100 hover:text-brand-300 transition-colors"
                    >
                      {t.title}
                    </Link>
                    <span className={`badge ${difficultyColors[t.difficulty] || ''} text-[11px]`}>
                      {t.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{t.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{t.duration}</span>
                    <span className="text-gray-600">·</span>
                    <span>{t.category}</span>
                    <span className="text-gray-600">·</span>
                    <span>{t.steps.length} kroků</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      toggleFavorite(t.id);
                      addToast('Odstraněno z oblíbených', 'success');
                    }}
                    className="btn-ghost p-2"
                    title="Odebrat z oblíbených"
                  >
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  </button>
                  <Link to={`/tutorials/${t.id}`} className="btn-ghost p-2 mt-auto">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
