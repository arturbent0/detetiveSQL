'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getFase, executarQuery } from '@/lib/api';
import { TUTORIAIS } from '@/types';
import TutorialInline from './TutorialInline';
import type { FaseData, QueryResponse } from '@/types';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

interface FasePageProps {
  faseId: number;
  proximaRota: string;
}

export default function FasePage({ faseId, proximaRota }: FasePageProps) {
  const router = useRouter();
  const [fase, setFase] = useState<FaseData | null>(null);
  const [sql, setSql] = useState('SELECT ');
  const [resultado, setResultado] = useState<QueryResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [extensions, setExtensions] = useState<unknown[]>([]);

  useEffect(() => {
    setFase(null);
    setResultado(null);
    setSql('SELECT ');
    getFase(faseId).then(setFase);

    Promise.all([
      import('@codemirror/lang-sql'),
      import('@codemirror/theme-one-dark'),
    ]).then(([{ sql: sqlLang }, { oneDark }]) => {
      setExtensions([sqlLang(), oneDark]);
    });
  }, [faseId]);

  const executar = useCallback(async () => {
    const sessaoId = localStorage.getItem('sessao_id');
    if (!sessaoId || !sql.trim()) return;
    setCarregando(true);
    const res = await executarQuery(sql, faseId, sessaoId);
    setResultado(res);
    setCarregando(false);
  }, [sql, faseId]);

  if (!fase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>Carregando caso...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔍</span>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>FASE {faseId} DE 4</p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{fase.titulo}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1fr_1.1fr] gap-5 items-start">
        {/* ===== COLUNA 1: TUTORIAL ===== */}
        <div className="flex flex-col gap-4">
          <TutorialInline
            titulo={TUTORIAIS[faseId as keyof typeof TUTORIAIS].titulo}
            topicos={TUTORIAIS[faseId as keyof typeof TUTORIAIS].topicos}
          />
        </div>

        {/* ===== COLUNA 2: CASO, OBJETIVO E TABELAS ===== */}
        <div className="flex flex-col gap-4">
          {fase.recap_fase_anterior && (
            <div className="rounded-xl p-4 border" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
              <h2 className="font-semibold mb-1 text-xs" style={{ color: 'var(--muted)' }}>📌 NO CAPÍTULO ANTERIOR</h2>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{fase.recap_fase_anterior}</p>
            </div>
          )}

          <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--muted)' }}>📋 O CASO</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
              {fase.narrativa}
            </p>
          </div>

          <div className="rounded-xl p-4 border" style={{ background: 'var(--surface2)', borderColor: 'var(--accent)', borderWidth: '1px' }}>
            <h2 className="font-semibold mb-2 text-sm" style={{ color: 'var(--accent)' }}>🎯 OBJETIVO</h2>
            <p className="text-sm" style={{ color: 'var(--text)' }}>{fase.objetivo}</p>
          </div>

          <div className="rounded-xl p-4 border" style={{ background: 'var(--surface2)', borderColor: 'var(--accent2)' }}>
            <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--accent2)' }}>FORMATO DA QUERY:</p>
            <pre className="rounded-lg p-3 text-xs overflow-x-auto" style={{ background: 'var(--surface)', color: '#93c5fd', fontFamily: 'monospace' }}>
              {fase.formato_query}
            </pre>
          </div>

          <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--muted)' }}>🗂️ TABELAS DISPONÍVEIS</h2>
            <div className="flex flex-col gap-3">
              {fase.tabelas_disponiveis.map((tabela) => (
                <div key={tabela}>
                  <p className="font-mono text-sm font-semibold mb-1" style={{ color: 'var(--accent2)' }}>{tabela}</p>
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: 'var(--surface2)' }}>
                          <th className="px-3 py-1 text-left" style={{ color: 'var(--muted)' }}>coluna</th>
                          <th className="px-3 py-1 text-left" style={{ color: 'var(--muted)' }}>tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fase.schema[tabela]?.map((col) => (
                          <tr key={col.coluna} style={{ borderTop: '1px solid var(--border)' }}>
                            <td className="px-3 py-1 font-mono" style={{ color: 'var(--text)' }}>{col.coluna}</td>
                            <td className="px-3 py-1 font-mono" style={{ color: 'var(--muted)' }}>{col.tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== COLUNA 3: EDITOR E RESULTADO (fixo ao rolar) ===== */}
        <div
          className="flex flex-col gap-4 md:sticky md:top-6"
          style={{ maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}
        >
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'var(--surface2)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>EDITOR SQL</span>
            </div>
            {extensions.length > 0 && (
              <CodeMirror
                value={sql}
                height="220px"
                extensions={extensions as never[]}
                onChange={(value) => setSql(value)}
                basicSetup={{ lineNumbers: true, foldGutter: false }}
              />
            )}
          </div>

          <button
            onClick={executar}
            disabled={carregando}
            className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--accent2)', color: '#fff' }}
          >
            {carregando ? 'Executando...' : '▶ Executar Consulta'}
          </button>

          {resultado && (
            <div className="flex flex-col gap-3">
              {!resultado.sucesso && resultado.erro_estrutural && (
                <div className="rounded-xl p-4 border" style={{ background: '#2d1b1b', borderColor: 'var(--error)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--error)' }}>❌ {resultado.erro_estrutural}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Veja o formato da query na coluna do meio para saber o que está faltando.</p>
                </div>
              )}

              {!resultado.sucesso && resultado.erro && (
                <div className="rounded-xl p-4 border" style={{ background: '#2d1b1b', borderColor: 'var(--error)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--error)' }}>❌ Erro na consulta</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{resultado.erro}</p>
                </div>
              )}

              {resultado.sucesso && resultado.correta && (
                <div className="rounded-xl p-4 border" style={{ background: '#1a2d1a', borderColor: 'var(--success)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--success)' }}>✅ Consulta correta!</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>Você encontrou uma nova pista. O caso avança.</p>
                  <button
                    onClick={() => router.push(proximaRota)}
                    className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--success)', color: '#000' }}
                  >
                    Próxima Fase →
                  </button>
                </div>
              )}

              {resultado.sucesso && !resultado.correta && resultado.dica && (
                <div className="rounded-xl p-4 border" style={{ background: '#2d2a1a', borderColor: 'var(--accent)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>💡 Dica</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{resultado.dica}</p>
                </div>
              )}

              {resultado.sucesso && !resultado.correta && resultado.resposta_comentada && (
                <div className="rounded-xl p-4 border" style={{ background: '#1a1d2d', borderColor: 'var(--accent2)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--accent2)' }}>📖 Resposta comentada</p>
                  <pre className="text-xs overflow-x-auto rounded-lg p-3" style={{ background: 'var(--surface2)', color: '#93c5fd', fontFamily: 'monospace' }}>
                    {resultado.resposta_comentada}
                  </pre>
                </div>
              )}

              {resultado.sucesso && resultado.resultado && resultado.resultado.length > 0 && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <p className="px-4 py-2 text-xs font-semibold" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                    RESULTADO, {resultado.resultado.length} linha(s)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: 'var(--surface)' }}>
                          {Object.keys(resultado.resultado[0]).map((col) => (
                            <th key={col} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--accent)' }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.resultado.map((row, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                            {Object.values(row).map((val, vi) => (
                              <td key={vi} className="px-3 py-2" style={{ color: 'var(--text)' }}>
                                {val === null ? <span style={{ color: 'var(--muted)' }}>NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
