'use client';
import { useRouter } from 'next/navigation';
import { criarSessao } from '@/lib/api';
import { limparRespostasSalvas } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  async function iniciar() {
    const sessaoId = await criarSessao();
    limparRespostasSalvas();
    localStorage.setItem('sessao_id', sessaoId);
    router.push('/abertura');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">🔍</div>
      <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
        Detetive SQL
      </h1>
      <p className="text-xl mb-2" style={{ color: 'var(--muted)' }}>
        Um crime foi cometido. Você é o único que pode resolver.
      </p>
      <p className="text-base mb-10 max-w-md" style={{ color: 'var(--muted)' }}>
        Use consultas SQL para investigar suspeitos, rastrear pistas e descobrir o culpado.
      </p>
      <button
        onClick={iniciar}
        className="px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        Iniciar Investigação
      </button>
    </main>
  );
}
