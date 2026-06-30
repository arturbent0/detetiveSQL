interface Topico {
  subtitulo: string;
  texto: string;
  exemplo?: string;
  resultado?: Record<string, unknown>[];
}

interface TutorialInlineProps {
  titulo: string;
  topicos: Topico[];
}

export default function TutorialInline({ titulo, topicos }: TutorialInlineProps) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📘</span>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{titulo}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {topicos.map((t, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--accent2)' }}>{t.subtitulo}</h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text)' }}>{t.texto}</p>

            {t.exemplo && (
              <pre className="rounded-lg p-2 text-xs overflow-x-auto mb-2" style={{ background: 'var(--surface)', color: '#93c5fd', fontFamily: 'monospace' }}>
                {t.exemplo}
              </pre>
            )}

            {t.resultado && (
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--surface)' }}>
                      {Object.keys(t.resultado[0]).map((col) => (
                        <th key={col} className="px-2 py-1 text-left font-semibold" style={{ color: 'var(--accent)' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.resultado.map((row, ri) => (
                      <tr key={ri} style={{ borderTop: '1px solid var(--border)' }}>
                        {Object.values(row).map((val, vi) => (
                          <td key={vi} className="px-2 py-1" style={{ color: 'var(--text)' }}>
                            {val === null ? <span style={{ color: 'var(--muted)' }}>NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
