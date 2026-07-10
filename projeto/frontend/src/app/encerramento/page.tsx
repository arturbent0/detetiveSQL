'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProgresso } from '@/lib/api';
import { limparRespostasSalvas } from '@/lib/storage';
import type { Progresso } from '@/types';

export default function Encerramento() {
  const router = useRouter();
  const [progresso, setProgresso] = useState<Progresso | null>(null);

  useEffect(() => {
    const sessaoId = localStorage.getItem('sessao_id');
    if (sessaoId) getProgresso(sessaoId).then(setProgresso);
  }, []);

  function reiniciar() {
    localStorage.removeItem('sessao_id');
    limparRespostasSalvas();
    router.push('/');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-6">⚖️</div>
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
        Caso Encerrado
      </h1>

      <div className="rounded-xl p-6 mb-6 w-full border text-left" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--accent2)' }}>📜 O Veredito</h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
          As evidências são conclusivas. <strong style={{ color: 'var(--accent)' }}>Marcos Oliveira</strong>,
          filho da vítima, esteve na Biblioteca por quase 50 minutos na noite do crime,
          tempo muito maior que o dos outros convidados. Ele chegou à mansão depois das 19h,
          mais tarde que a maioria dos presentes, condizente com alguém que se atrasou de propósito
          para evitar testemunhas antes de agir.
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Suas consultas SQL cruzaram presença, local e horário até sobrar um único suspeito.
        </p>
      </div>

      {progresso && (
        <div className="rounded-xl p-6 mb-6 w-full border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 text-left" style={{ color: 'var(--accent2)' }}>📊 Seu Desempenho</h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((f) => {
              const dados = progresso.porFase[f];
              return (
                <div key={f} className="rounded-lg p-3 border text-left" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>FASE {f}</p>
                  {dados ? (
                    <>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>
                        {dados.tentativas} tentativa{dados.tentativas !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs" style={{ color: dados.acertos > 0 ? 'var(--success)' : 'var(--muted)' }}>
                        {dados.acertos > 0 ? '✅ Resolvida' : '—'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>—</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={reiniciar}
        className="px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        Jogar Novamente
      </button>
    </main>
  );
}
