import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error:   <XCircle    size={16} className="text-red-400" />,
  info:    <Info       size={16} className="text-blue-400" />,
};

const borders = {
  success: 'border-emerald-500/30',
  error:   'border-red-500/30',
  info:    'border-blue-500/30',
};

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-up glass border ${borders[t.type] || borders.info}
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-card min-w-[240px] max-w-sm`}
        >
          {icons[t.type] || icons.info}
          <p className="flex-1 text-sm text-gray-200">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-gray-300 ml-1">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
