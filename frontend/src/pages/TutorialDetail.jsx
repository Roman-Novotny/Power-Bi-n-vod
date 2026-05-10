import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, AlertTriangle, Lightbulb, CheckCircle, ChevronRight } from 'lucide-react';
import { tutorials, difficultyColors } from '../data/tutorials';
import CodeBlock from '../components/CodeBlock';
import { useApp } from '../context/AppContext';

export default function TutorialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, addToast } = useApp();

  const tutorial = tutorials.find(t => t.id === id);

  if (!tutorial) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-gray-400 text-lg">Návod nenalezen.</p>
        <Link to="/tutorials" className="btn-primary mt-4 inline-flex">Zpět na návody</Link>
      </div>
    );
  }

  const isFav = favorites.includes(tutorial.id);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      {/* Breadcrumb & back */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/tutorials" className="hover:text-gray-300 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Návody
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-400">{tutorial.title}</span>
      </div>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${difficultyColors[tutorial.difficulty]}`}>{tutorial.difficulty}</span>
              <span className="badge bg-white/5 text-gray-400">{tutorial.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">{tutorial.title}</h1>
            <p className="text-gray-400 leading-relaxed">{tutorial.description}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {tutorial.duration}</span>
              <span>·</span>
              <span>{tutorial.steps.length} kroků</span>
            </div>
          </div>
          <button
            onClick={() => {
              toggleFavorite(tutorial.id);
              addToast(isFav ? 'Odstraněno z oblíbených' : 'Přidáno do oblíbených', 'success');
            }}
            className="btn-ghost p-2.5 flex-shrink-0"
          >
            <Star size={20} className={isFav ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
          {tutorial.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 text-gray-500">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-400" />
          Postup
        </h2>

        {tutorial.steps.map((step, i) => (
          <div key={i} className="step-card">
            {/* Step number dot */}
            <div className="absolute left-0 top-5 w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <span className="text-brand-400 text-xs font-bold">{i + 1}</span>
            </div>

            <div className="card p-5 ml-4">
              <h3 className="font-semibold text-gray-100 mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{step.content}</p>

              {step.code && (
                <div className="mt-3">
                  <CodeBlock code={step.code} language={step.language || 'dax'} title={step.title} />
                </div>
              )}

              {step.tip && (
                <div className="mt-3 flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <Lightbulb size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300/80 leading-relaxed">{step.tip}</p>
                </div>
              )}

              {step.warning && (
                <div className="mt-3 flex gap-2.5 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                  <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/80 leading-relaxed">{step.warning}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          <ArrowLeft size={15} /> Zpět
        </button>
        <Link to="/tutorials" className="btn-primary text-sm">
          Všechny návody <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
