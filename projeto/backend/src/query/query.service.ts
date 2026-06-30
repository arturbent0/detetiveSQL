import { getCasoDb, rowsToObjects } from '../database/caso.db';
import { fases } from '../fase/fases.data';

const ALLOWED_KEYWORDS = /^SELECT\s/i;
const FORBIDDEN = /(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|ATTACH|DETACH|PRAGMA)/i;

export interface QueryResult {
  sucesso: boolean;
  erro?: string;
  erro_estrutural?: string;
  resultado?: Record<string, unknown>[];
  correta?: boolean;
  dica?: string;
  resposta_comentada?: string;
  num_tentativa?: number;
}

function validarEstrutura(sql: string, faseId: number): string | null {
  const fase = fases.find((f) => f.id === faseId);
  if (!fase) return null;

  for (const clausula of fase.clausulas_esperadas) {
    if (clausula.obrigatoria && !clausula.regex.test(sql)) {
      return clausula.mensagem_faltando;
    }
  }
  return null;
}

export async function executarQuery(
  sql: string,
  faseId: number,
  numTentativa: number
): Promise<QueryResult> {
  const sqlTrimmed = sql.trim();

  if (!ALLOWED_KEYWORDS.test(sqlTrimmed)) {
    return { sucesso: false, erro: 'Apenas consultas SELECT são permitidas.' };
  }

  if (FORBIDDEN.test(sqlTrimmed)) {
    return { sucesso: false, erro: 'Comando não permitido.' };
  }

  const fase = fases.find((f) => f.id === faseId);
  if (!fase) {
    return { sucesso: false, erro: 'Fase não encontrada.' };
  }

  // Validação estrutural antes de executar no banco
  const erroEstrutural = validarEstrutura(sqlTrimmed, faseId);
  if (erroEstrutural) {
    return {
      sucesso: false,
      erro_estrutural: erroEstrutural,
    };
  }

  const db = await getCasoDb();

  try {
    const stmt = db.prepare(sqlTrimmed);
    const resultado = rowsToObjects(stmt);
    const correta = fase.validacao(resultado);

    if (correta) {
      return { sucesso: true, resultado, correta: true };
    }

    if (numTentativa === 1) {
      return {
        sucesso: true,
        resultado,
        correta: false,
        dica: fase.dica,
        num_tentativa: numTentativa,
      };
    }

    return {
      sucesso: true,
      resultado,
      correta: false,
      resposta_comentada: fase.resposta_comentada,
      num_tentativa: numTentativa,
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: `Sua consulta tem um erro de sintaxe. Revise o formato da query no painel ao lado. (Detalhe técnico: ${(err as Error).message})`,
    };
  } finally {
    db.close();
  }
}
