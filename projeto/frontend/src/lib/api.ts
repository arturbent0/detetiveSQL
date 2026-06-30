const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function criarSessao(): Promise<string> {
  const res = await fetch(`${API_URL}/sessao`, { method: 'POST' });
  const data = await res.json();
  return data.sessao_id;
}

export async function getFase(id: number) {
  const res = await fetch(`${API_URL}/fase/${id}`);
  return res.json();
}

export async function executarQuery(sql: string, faseId: number, sessaoId: string) {
  const res = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, fase_id: faseId, sessao_id: sessaoId }),
  });
  return res.json();
}

export async function getProgresso(sessaoId: string) {
  const res = await fetch(`${API_URL}/progresso/${sessaoId}`);
  return res.json();
}
