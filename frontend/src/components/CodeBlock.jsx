import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

const langMap = { dax: 'javascript', mquery: 'javascript', sql: 'sql', default: 'text' };

export default function CodeBlock({ code, language = 'dax', title, onExport }) {
  const { copyToClipboard } = useApp();
  const [copied, setCopied] = useState(false);

  const lang = langMap[language] || langMap.default;

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'kod'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-block group">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          {title && <span className="text-xs text-gray-500 ml-2">{title}</span>}
          <span className="text-[10px] uppercase tracking-widest text-gray-600 ml-1">{language.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          {onExport !== false && (
            <button onClick={handleExport} className="btn-ghost px-2 py-1 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Download size={13} />
              <span className="hidden sm:inline">Exportovat</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="btn-ghost px-2.5 py-1 text-xs gap-1.5"
          >
            {copied ? (
              <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Zkopírováno</span></>
            ) : (
              <><Copy size={13} /><span>Kopírovat</span></>
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '16px',
          background: 'transparent',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        showLineNumbers={code.split('\n').length > 3}
        lineNumberStyle={{ color: '#374151', fontSize: '11px', minWidth: '2rem', paddingRight: '1rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
