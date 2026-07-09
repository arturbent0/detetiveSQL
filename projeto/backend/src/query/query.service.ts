import { getCasoDb, rowsToObjects } from '../database/caso.db';
import { fases } from '../fase/fases.data';

const ALLOWED_KEYWORDS = /^SELECT\s/i;
const FORBIDDEN = /(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|ATTACH|DETACH|PRAGMA)/i;

export interface QueryResult {
  sucesso: boolean;
  erro?: string;
  erro_estrutural?: string;
  erro_ortografia?: string;
  analise?: string;
  resultado?: Record<string, unknown>[];
  correta?: boolean;
  dica?: string;
  resposta_comentada?: string;
  num_tentativa?: number;
}

// ── Levenshtein distance ─────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// ── Known identifiers (never flag these as typos) ────────────────────────────

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS',
  'JOIN', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'AS', 'AND', 'OR', 'NOT',
  'IN', 'SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'DISTINCT', 'LIMIT', 'OFFSET',
  'NULL', 'IS', 'LIKE', 'BETWEEN', 'DESC', 'ASC', 'UNION', 'ALL', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'OVER', 'PARTITION',
]);

const IDENTIFIERS_VALIDOS = new Set([
  'presencas', 'convidados', 'visitas_sala', 'registros_tempo', 'salas',
  'id', 'convidado_id', 'data', 'hora_chegada', 'hora_saida', 'local',
  'nome', 'relacao', 'sala_id', 'ocasiao', 'minutos', 'observacao',
  // common aliases used in this game
  'c', 'v', 'r', 'p', 's',
  // common result aliases students use
  'total', 'total_minutos', 'visita', 'suspeito', 'chegada', 'saida',
]);

const TABELAS_CONHECIDAS = ['presencas', 'convidados', 'visitas_sala', 'registros_tempo', 'salas'];

const COLUNAS_CONHECIDAS: Record<string, string[]> = {
  presencas: ['id', 'convidado_id', 'data', 'hora_chegada', 'hora_saida', 'local'],
  convidados: ['id', 'nome', 'relacao'],
  visitas_sala: ['id', 'convidado_id', 'sala_id', 'ocasiao'],
  registros_tempo: ['id', 'convidado_id', 'sala_id', 'minutos', 'data', 'observacao'],
  salas: ['id', 'nome'],
};

const TODAS_COLUNAS = [...new Set(Object.values(COLUNAS_CONHECIDAS).flat())];

// ── Detect misspelled SQL keywords ───────────────────────────────────────────

// Same letters, different order (transposição) — catches FORM→FROM, JOIM→JOIN, etc.
function mesmosCaracteres(a: string, b: string): boolean {
  return a.length === b.length && a.split('').sort().join('') === b.split('').sort().join('');
}

function detectarKeywordErrada(sql: string): string | null {
  // Remove string literals so we don't flag content inside quotes
  const semStrings = sql.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
  const tokens = semStrings.match(/\b[A-Za-z_][A-Za-z_0-9]*\b/g) ?? [];

  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (SQL_KEYWORDS.has(upper)) continue;
    if (IDENTIFIERS_VALIDOS.has(token.toLowerCase())) continue;
    if (token.length < 3) continue;

    let melhorSugestao: string | null = null;
    let melhorDist = 999;

    for (const kw of SQL_KEYWORDS) {
      // Skip very short keywords (OR, IN, AS, BY, ON, IS) — too many false positives
      if (kw.length < 3) continue;

      const dist = levenshtein(upper, kw);
      // Match if within edit distance 2, OR if it's a transposition (same chars, swapped)
      const transposicao = dist === 2 && mesmosCaracteres(upper, kw);
      const dentroDeLimiar = dist > 0 && dist <= 2;

      if ((dentroDeLimiar || transposicao) && dist < melhorDist) {
        melhorDist = dist;
        melhorSugestao = kw;
      }
    }

    if (melhorSugestao) {
      return `Erro de digitação detectado: você escreveu '${token}', mas o comando SQL correto é ${melhorSugestao}. Corrija a ortografia e tente novamente.`;
    }
  }

  return null;
}

// ── Translate SQLite runtime errors to Portuguese ────────────────────────────

function melhorSugestaoStr(alvo: string, lista: string[]): string {
  return lista
    .map((s) => ({ s, d: levenshtein(alvo.toLowerCase(), s.toLowerCase()) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map((x) => `'${x.s}'`)
    .join(' ou ');
}

function traduzirErroSQLite(erro: string): string {
  // "no such column: X" or "no such column: alias.X"
  const colMatch = erro.match(/no such column:\s*(\S+)/i);
  if (colMatch) {
    const colRaw = colMatch[1];
    const col = colRaw.includes('.') ? colRaw.split('.').pop()! : colRaw;
    const sugestao = melhorSugestaoStr(col, TODAS_COLUNAS);
    return `A coluna '${colRaw}' não existe. Você quis dizer ${sugestao}? Lembre-se de usar o prefixo do alias da tabela (ex: c.nome, v.sala_id, r.minutos).`;
  }

  // "no such table: X"
  const tblMatch = erro.match(/no such table:\s*(\S+)/i);
  if (tblMatch) {
    const tbl = tblMatch[1];
    const sugestao = melhorSugestaoStr(tbl, TABELAS_CONHECIDAS);
    return `A tabela '${tbl}' não existe. Você quis dizer ${sugestao}? Tabelas disponíveis: ${TABELAS_CONHECIDAS.join(', ')}.`;
  }

  // "ambiguous column name: X"
  const ambigMatch = erro.match(/ambiguous column name:\s*(\S+)/i);
  if (ambigMatch) {
    const col = ambigMatch[1];
    return `A coluna '${col}' aparece em mais de uma tabela no JOIN. Use o prefixo do alias para especificar qual tabela você quer (ex: c.${col} ou v.${col}).`;
  }

  // "near "X": syntax error"
  const synMatch = erro.match(/near "([^"]+)":\s*syntax error/i);
  if (synMatch) {
    return `Erro de sintaxe perto de '${synMatch[1]}'. Verifique se a palavra está escrita corretamente e se está na posição certa dentro da query.`;
  }

  // misuse of aggregate
  if (/misuse of aggregate/i.test(erro)) {
    return `Você está usando uma função de agregação (SUM, COUNT...) sem GROUP BY. Adicione GROUP BY para agrupar os dados antes de calcular a soma ou contagem.`;
  }

  // no such function
  const funcMatch = erro.match(/no such function:\s*(\S+)/i);
  if (funcMatch) {
    return `A função '${funcMatch[1]}' não existe. Funções de agregação disponíveis: SUM(), COUNT(), AVG(), MAX(), MIN().`;
  }

  // syntax error generic
  if (/syntax error/i.test(erro)) {
    return `Erro de sintaxe na query. Revise o formato no painel central e verifique se as palavras-chave estão escritas corretamente. (Detalhe: ${erro})`;
  }

  return `Erro ao executar a consulta. Detalhe técnico: ${erro}`;
}

// ── Analyze what's wrong with a wrong result ─────────────────────────────────

function analisarResultadoErrado(resultado: Record<string, unknown>[], faseId: number): string {
  const linhas = resultado.length;

  if (faseId === 1) {
    if (linhas === 0) {
      return "Sua query não retornou nenhum resultado. Verifique se o valor do local está exatamente como 'Mansão Belmont' (com acento e maiúsculas) e a data como '2024-03-15' — ambos com aspas simples.";
    }
    if (linhas > 5) {
      return `Sua query retornou ${linhas} linhas, mas deveriam ser exatamente 5. Provavelmente está faltando uma das condições do WHERE: você está filtrando por local E data ao mesmo tempo com AND?`;
    }
    const r = resultado[0];
    if (!('convidado_id' in r)) {
      return "Sua query retorna dados, mas as colunas estão erradas. O objetivo pede especificamente: convidado_id, hora_chegada e hora_saida.";
    }
    return `Sua query retornou ${linhas} linha(s), mas deveriam ser 5. Verifique se as duas condições do WHERE estão corretas e combinadas com AND.`;
  }

  if (faseId === 2) {
    if (linhas === 0) {
      return "Nenhum resultado retornado. O INNER JOIN pode estar conectando as colunas erradas, ou o filtro WHERE v.sala_id = 1 (Biblioteca) não está aplicado. Verifique o ON do JOIN.";
    }
    const nomes = resultado.map((r) => String(r.nome ?? ''));
    if (nomes.includes('Ana Souza')) {
      return "Ana Souza apareceu no resultado, mas ela não esteve na Biblioteca. Isso indica que o WHERE não está filtrando por v.sala_id = 1, ou o id da Biblioteca está errado (deveria ser 1).";
    }
    if (linhas > 4) {
      return `Muitos resultados: ${linhas} linhas. A Biblioteca teve apenas 4 visitantes. Verifique se WHERE v.sala_id = 1 está presente e correto.`;
    }
    return "Os convidados retornados não estão todos certos. Confirme que o ON conecta c.id = v.convidado_id e que WHERE v.sala_id = 1 filtra a Biblioteca.";
  }

  if (faseId === 3) {
    if (linhas === 0) {
      return "Nenhum resultado. Certifique-se de que o WHERE filtra r.sala_id = 1 (Biblioteca), o HAVING usa SUM(r.minutos) > 10 e o GROUP BY está correto.";
    }
    if (linhas === 1) {
      const nome = String(resultado[0].nome ?? 'o convidado');
      return `Apenas '${nome}' apareceu. Deveria haver 2 suspeitos. Verifique se o HAVING usa > 10 (e não >= 10 ou outro valor), e se o GROUP BY agrupa por c.id, c.nome.`;
    }
    if (linhas > 2) {
      return `Muitos resultados: ${linhas} linhas. O HAVING SUM(r.minutos) > 10 deveria filtrar para exatamente 2 convidados. Verifique se o WHERE filtra r.sala_id = 1 e o GROUP BY está agrupando corretamente.`;
    }
    const nomes = resultado.map((r) => String(r.nome ?? ''));
    if (!nomes.includes('Roberto Lima') || !nomes.includes('Marcos Oliveira')) {
      return "Os dois convidados retornados não são os esperados — deveriam ser Roberto Lima e Marcos Oliveira. Verifique o filtro sala_id = 1 e a condição do HAVING.";
    }
    // Correct names — check order
    const totalKey = Object.keys(resultado[0]).find(
      (k) => k.includes('total') || k.includes('minuto')
    );
    if (totalKey) {
      const v0 = Number(resultado[0][totalKey]);
      const v1 = Number(resultado[1][totalKey]);
      if (v0 < v1) {
        return "Os nomes estão corretos, mas a ordem está invertida. Use ORDER BY total_minutos DESC para colocar o maior tempo primeiro.";
      }
    }
    return "Os dados estão quase certos. Verifique se a coluna de soma usa AS total_minutos e se a ordenação é DESC.";
  }

  if (faseId === 4) {
    if (linhas === 0) {
      return "Nenhum resultado. A subconsulta IN ou a condição de hora podem estar erradas. A subconsulta deve buscar quem esteve na Biblioteca (sala_id = 1), e a condição é p.hora_chegada > '19:00'.";
    }
    if (linhas > 1) {
      const suspeitos = resultado.map((r) => String((r as Record<string, unknown>).suspeito ?? (r as Record<string, unknown>).nome ?? ''));
      if (suspeitos.some((s) => s.includes('Roberto'))) {
        return "Roberto Lima apareceu, mas ele chegou antes das 19h. Certifique-se de que AND p.hora_chegada > '19:00' está no WHERE da consulta principal — e não dentro da subconsulta.";
      }
      return `Muitos resultados: ${linhas} linhas. Apenas Marcos Oliveira é o culpado. Verifique a condição de hora de chegada: p.hora_chegada > '19:00'.`;
    }
    const r = resultado[0] as Record<string, unknown>;
    const nome = String(r.suspeito ?? r.nome ?? '');
    if (nome && nome !== 'Marcos Oliveira') {
      return `O suspeito retornado foi '${nome}', mas o culpado é outro. Verifique a subconsulta (sala_id = 1) e a condição de hora.`;
    }
    return "O resultado está quase certo. Verifique se os aliases estão corretos: c.nome AS suspeito e p.hora_chegada AS chegada.";
  }

  return "Os dados retornados não correspondem ao esperado para esta fase.";
}

// ── Structural validation ────────────────────────────────────────────────────

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

// ── Main execution ───────────────────────────────────────────────────────────

export async function executarQuery(
  sql: string,
  faseId: number,
  numTentativa: number
): Promise<QueryResult> {
  const sqlTrimmed = sql.trim();

  // 1. Block truly dangerous commands first (security)
  if (FORBIDDEN.test(sqlTrimmed)) {
    return { sucesso: false, erro: 'Comando não permitido neste ambiente.' };
  }

  const fase = fases.find((f) => f.id === faseId);
  if (!fase) {
    return { sucesso: false, erro: 'Fase não encontrada.' };
  }

  // 2. Check for keyword typos — catches things like SELCT, FORM, WHER
  //    (must run before the SELECT check so "SELCT" gets a helpful message)
  const erroDigitacao = detectarKeywordErrada(sqlTrimmed);
  if (erroDigitacao) {
    return { sucesso: false, erro_ortografia: erroDigitacao };
  }

  // 3. Must start with SELECT
  if (!ALLOWED_KEYWORDS.test(sqlTrimmed)) {
    return {
      sucesso: false,
      erro: 'Apenas consultas SELECT são permitidas. Sua query deve começar com a palavra SELECT.',
    };
  }

  // 2. Structural validation (required clauses)
  const erroEstrutural = validarEstrutura(sqlTrimmed, faseId);
  if (erroEstrutural) {
    return { sucesso: false, erro_estrutural: erroEstrutural };
  }

  const db = await getCasoDb();

  try {
    const stmt = db.prepare(sqlTrimmed);
    const resultado = rowsToObjects(stmt);
    const correta = fase.validacao(resultado);

    if (correta) {
      return { sucesso: true, resultado, correta: true };
    }

    // Specific diagnosis of the wrong result
    const analise = analisarResultadoErrado(resultado, faseId);

    // Progressive hints: 3 before revealing the full answer
    const MAX_DICAS = fase.dicas.length;
    if (numTentativa <= MAX_DICAS) {
      return {
        sucesso: true,
        resultado,
        correta: false,
        analise,
        dica: fase.dicas[numTentativa - 1],
        num_tentativa: numTentativa,
      };
    }

    return {
      sucesso: true,
      resultado,
      correta: false,
      analise,
      resposta_comentada: fase.resposta_comentada,
      num_tentativa: numTentativa,
    };
  } catch (err) {
    const msgErro = (err as Error).message;
    return {
      sucesso: false,
      erro: traduzirErroSQLite(msgErro),
    };
  } finally {
    db.close();
  }
}
