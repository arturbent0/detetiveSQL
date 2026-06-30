import { getProgressoDb, rowsToObjects, persistProgressoDb } from '../database/caso.db';
import { v4 as uuidv4 } from 'uuid';

export async function criarSessao(): Promise<string> {
  const db = await getProgressoDb();
  const id = uuidv4();
  db.run('INSERT INTO sessoes (id) VALUES (?)', [id]);
  persistProgressoDb();
  return id;
}

export async function getSessao(sessaoId: string) {
  const db = await getProgressoDb();
  const stmt = db.prepare('SELECT * FROM sessoes WHERE id = ?');
  stmt.bind([sessaoId]);
  const rows = rowsToObjects(stmt);
  return rows[0] ?? null;
}

export async function registrarTentativa(
  sessaoId: string,
  fase: number,
  query: string,
  correta: boolean,
  numTentativa: number
) {
  const db = await getProgressoDb();
  db.run(
    'INSERT INTO tentativas (sessao_id, fase, query, correta, numero_tentativa) VALUES (?, ?, ?, ?, ?)',
    [sessaoId, fase, query, correta ? 1 : 0, numTentativa]
  );

  if (correta) {
    db.run(
      "UPDATE sessoes SET fase_atual = ?, atualizada_em = datetime('now') WHERE id = ?",
      [fase + 1, sessaoId]
    );
  }

  persistProgressoDb();
}

export async function getProgresso(sessaoId: string) {
  const db = await getProgressoDb();

  const sessaoStmt = db.prepare('SELECT * FROM sessoes WHERE id = ?');
  sessaoStmt.bind([sessaoId]);
  const sessaoRows = rowsToObjects(sessaoStmt);
  const sessao = sessaoRows[0] as { id: string; fase_atual: number } | undefined;

  if (!sessao) {
    return null;
  }

  const tentativasStmt = db.prepare(
    'SELECT * FROM tentativas WHERE sessao_id = ? ORDER BY criada_em'
  );
  tentativasStmt.bind([sessaoId]);
  const tentativas = rowsToObjects(tentativasStmt) as {
    fase: number;
    correta: number;
    numero_tentativa: number;
  }[];

  const porFase: Record<number, { acertos: number; tentativas: number }> = {};
  for (const t of tentativas) {
    if (!porFase[t.fase]) porFase[t.fase] = { acertos: 0, tentativas: 0 };
    porFase[t.fase].tentativas++;
    if (t.correta) porFase[t.fase].acertos++;
  }

  return { sessao, porFase };
}

export async function getNumTentativas(sessaoId: string, fase: number): Promise<number> {
  const db = await getProgressoDb();
  const stmt = db.prepare(
    'SELECT COUNT(*) as total FROM tentativas WHERE sessao_id = ? AND fase = ? AND correta = 0'
  );
  stmt.bind([sessaoId, fase]);
  const rows = rowsToObjects(stmt) as { total: number }[];
  return rows[0]?.total ?? 0;
}
