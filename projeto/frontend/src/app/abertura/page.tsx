'use client';
import { useRouter } from 'next/navigation';

export default function Abertura() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 max-w-2xl mx-auto">
      <div className="text-5xl mb-6">🕵️</div>
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--accent)' }}>
        Bem-vindo, Detetive
      </h1>

      <div className="rounded-xl p-6 mb-6 w-full border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="mb-4" style={{ color: 'var(--text)' }}>
          Você acaba de receber um caso urgente. Um assassinato aconteceu no escritório de uma empresa, e
          as autoridades precisam de você para identificar o culpado.
        </p>
        <p className="mb-4" style={{ color: 'var(--text)' }}>
          Sua principal ferramenta é o <strong style={{ color: 'var(--accent)' }}>banco de dados</strong> da empresa,
          um sistema que armazena informações organizadas em <strong style={{ color: 'var(--accent)' }}>tabelas</strong>.
        </p>
        <p style={{ color: 'var(--muted)' }}>
          Cada tabela tem colunas (tipos de informação) e linhas (registros individuais).
          Você vai aprender a fazer perguntas a esse banco de dados usando <strong style={{ color: 'var(--accent2)' }}>SQL</strong>.
        </p>
      </div>

      <div className="rounded-xl p-4 mb-8 w-full border" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          📋 Em cada fase, você encontrará um tutorial explicando a ferramenta SQL que vai usar,
          já na mesma tela do caso. Leia com atenção, ela será a sua arma para resolver o caso.
        </p>
      </div>

      <button
        onClick={() => router.push('/fase/1')}
        className="px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        Começar →
      </button>
    </main>
  );
}
