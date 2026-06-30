export interface ClauseCheck {
  clausula: string;
  obrigatoria: boolean;
  regex: RegExp;
  mensagem_faltando: string;
}

export interface Fase {
  id: number;
  titulo: string;
  narrativa: string;
  objetivo: string;
  tabelas_disponiveis: string[];
  schema: Record<string, { coluna: string; tipo: string }[]>;
  formato_query: string;
  clausulas_esperadas: ClauseCheck[];
  dica: string;
  resposta_comentada: string;
  resumo_ferramenta: { titulo: string; pontos: string[] };
  recap_fase_anterior?: string;
  validacao: (resultado: Record<string, unknown>[]) => boolean;
}

export const fases: Fase[] = [
  {
    id: 1,
    titulo: 'A Noite do Crime',
    narrativa: `Na noite de 15 de março de 2024, o dono da Mansão Belmont foi encontrado morto em seu jantar anual.
    Você precisa descobrir quem estava na mansão naquela noite.
    O sistema de segurança registra a chegada e a saída de cada convidado, identificado pelo convidado_id.
    Consulte os registros de presença para listar quem esteve na Mansão Belmont nessa data.`,
    objetivo: "Liste o convidado_id, hora_chegada e hora_saida de todos os registros da Mansão Belmont no dia 2024-03-15.",
    tabelas_disponiveis: ['presencas'],
    schema: {
      presencas: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'convidado_id', tipo: 'INTEGER' },
        { coluna: 'data', tipo: 'TEXT' },
        { coluna: 'hora_chegada', tipo: 'TEXT' },
        { coluna: 'hora_saida', tipo: 'TEXT' },
        { coluna: 'local', tipo: 'TEXT' },
      ],
    },
    formato_query: 'SELECT colunas\nFROM tabela\nWHERE condição',
    clausulas_esperadas: [
      { clausula: 'SELECT', obrigatoria: true, regex: /^SELECT\s/i, mensagem_faltando: 'Está faltando o SELECT!' },
      { clausula: 'FROM', obrigatoria: true, regex: /\sFROM\s/i, mensagem_faltando: 'Está faltando o FROM!' },
      { clausula: 'WHERE', obrigatoria: true, regex: /\sWHERE\s/i, mensagem_faltando: 'Está faltando um WHERE!' },
    ],
    dica: "Use SELECT para escolher convidado_id, hora_chegada e hora_saida. Use WHERE para filtrar local = 'Mansão Belmont' e data = '2024-03-15'.",
    resposta_comentada: `SELECT convidado_id, hora_chegada, hora_saida
FROM presencas
WHERE local = 'Mansão Belmont'
  AND data = '2024-03-15'`,
    resumo_ferramenta: {
      titulo: 'SELECT, FROM e WHERE',
      pontos: [
        'SELECT colunas, escolhe o que aparece no resultado',
        'FROM tabela, de onde vêm os dados',
        "WHERE condição, filtra as linhas (ex: WHERE local = 'Mansão Belmont')",
        'Combine condições com AND',
      ],
    },
    validacao: (resultado) => {
      const ids = resultado.map((r) => Number((r as { convidado_id: number }).convidado_id));
      return (
        ids.includes(1) &&
        ids.includes(2) &&
        ids.includes(3) &&
        ids.includes(4) &&
        ids.includes(5) &&
        resultado.length === 5
      );
    },
  },
  {
    id: 2,
    titulo: 'Quem Esteve na Biblioteca',
    narrativa: `Você identificou 5 convidados presentes na mansão naquela noite: ids 1, 2, 3, 4 e 5.
    O corpo foi encontrado na Biblioteca. Agora você precisa saber quais desses convidados
    estiveram na Biblioteca durante a noite. As visitas a cada sala ficam registradas em outra tabela,
    junto com o nome de cada convidado.
    Você vai precisar unir as tabelas convidados e visitas_sala com um INNER JOIN.`,
    objetivo: "Liste o nome do convidado e a ocasião da visita (use AS visita) para todas as visitas à Biblioteca.",
    tabelas_disponiveis: ['convidados', 'visitas_sala'],
    schema: {
      convidados: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'nome', tipo: 'TEXT' },
        { coluna: 'relacao', tipo: 'TEXT' },
      ],
      visitas_sala: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'convidado_id', tipo: 'INTEGER' },
        { coluna: 'sala_id', tipo: 'INTEGER' },
        { coluna: 'ocasiao', tipo: 'TEXT' },
      ],
    },
    formato_query: 'SELECT colunas\nFROM tabela1 alias1\nINNER JOIN tabela2 alias2 ON condição\nWHERE condição',
    clausulas_esperadas: [
      { clausula: 'SELECT', obrigatoria: true, regex: /^SELECT\s/i, mensagem_faltando: 'Está faltando o SELECT!' },
      { clausula: 'FROM', obrigatoria: true, regex: /\sFROM\s/i, mensagem_faltando: 'Está faltando o FROM!' },
      { clausula: 'INNER JOIN', obrigatoria: true, regex: /\sINNER\s+JOIN\s/i, mensagem_faltando: 'Está faltando um INNER JOIN!' },
      { clausula: 'ON', obrigatoria: true, regex: /\sON\s/i, mensagem_faltando: 'Está faltando a condição ON do JOIN!' },
      { clausula: 'WHERE', obrigatoria: true, regex: /\sWHERE\s/i, mensagem_faltando: 'Está faltando o WHERE para filtrar a sala_id da Biblioteca!' },
      { clausula: 'AS', obrigatoria: false, regex: /\sAS\s/i, mensagem_faltando: 'Está faltando um AS para renomear a coluna da ocasião!' },
    ],
    dica: 'Una convidados com visitas_sala usando INNER JOIN ... ON c.id = v.convidado_id. Filtre com WHERE v.sala_id = 1 (Biblioteca). Renomeie v.ocasiao com AS visita.',
    resposta_comentada: `SELECT c.nome, v.ocasiao AS visita
FROM convidados c
INNER JOIN visitas_sala v ON c.id = v.convidado_id
WHERE v.sala_id = 1`,
    resumo_ferramenta: {
      titulo: 'INNER JOIN e AS',
      pontos: [
        'convidados c, "c" é o apelido (alias) da tabela convidados',
        'INNER JOIN visitas_sala v ON c.id = v.convidado_id, junta as duas tabelas onde o id do convidado é igual ao convidado_id da visita',
        'AS renomeia uma coluna só para exibição, não muda o banco de dados (ex: v.ocasiao AS visita)',
        'WHERE pode filtrar por uma coluna numérica também, como sala_id = 1',
      ],
    },
    recap_fase_anterior: 'Na Fase 1, você descobriu 5 ids de convidados que estavam na Mansão Belmont na noite do crime: 1, 2, 3, 4 e 5.',
    validacao: (resultado) => {
      const nomes = resultado.map((r) => (r as { nome: string }).nome);
      const unicos = Array.from(new Set(nomes));
      return (
        unicos.includes('Carlos Menezes') &&
        unicos.includes('Roberto Lima') &&
        unicos.includes('Marcos Oliveira') &&
        unicos.includes('Fernanda Costa') &&
        !unicos.includes('Ana Souza')
      );
    },
  },
  {
    id: 3,
    titulo: 'Tempo na Cena do Crime',
    narrativa: `Carlos, Roberto, Marcos e Fernanda estiveram na Biblioteca em algum momento da noite. Ana não foi até lá.
    As câmeras de corredor registraram quanto tempo cada um passou perto da Biblioteca, em minutos,
    em diferentes momentos da noite. Alguém pode ter ficado tempo demais perto da cena do crime.
    Some o tempo total de cada convidado na Biblioteca e filtre quem passou mais de 10 minutos no total.`,
    objetivo: 'Liste o nome de cada convidado e o total de minutos na Biblioteca (use AS total_minutos). Mostre apenas quem passou mais de 10 minutos no total. Ordene do maior para o menor tempo.',
    tabelas_disponiveis: ['convidados', 'registros_tempo'],
    schema: {
      convidados: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'nome', tipo: 'TEXT' },
        { coluna: 'relacao', tipo: 'TEXT' },
      ],
      registros_tempo: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'convidado_id', tipo: 'INTEGER' },
        { coluna: 'sala_id', tipo: 'INTEGER' },
        { coluna: 'minutos', tipo: 'REAL' },
        { coluna: 'data', tipo: 'TEXT' },
        { coluna: 'observacao', tipo: 'TEXT' },
      ],
    },
    formato_query: 'SELECT colunas, SUM(coluna) AS nome\nFROM tabela1 alias1\nINNER JOIN tabela2 alias2 ON condição\nWHERE condição\nGROUP BY colunas\nHAVING condição\nORDER BY coluna',
    clausulas_esperadas: [
      { clausula: 'SELECT', obrigatoria: true, regex: /^SELECT\s/i, mensagem_faltando: 'Está faltando o SELECT!' },
      { clausula: 'FROM', obrigatoria: true, regex: /\sFROM\s/i, mensagem_faltando: 'Está faltando o FROM!' },
      { clausula: 'INNER JOIN', obrigatoria: true, regex: /\sINNER\s+JOIN\s/i, mensagem_faltando: 'Está faltando um INNER JOIN!' },
      { clausula: 'WHERE', obrigatoria: true, regex: /\sWHERE\s/i, mensagem_faltando: 'Está faltando o WHERE para filtrar a sala_id da Biblioteca!' },
      { clausula: 'GROUP BY', obrigatoria: true, regex: /\sGROUP\s+BY\s/i, mensagem_faltando: 'Está faltando o GROUP BY!' },
      { clausula: 'HAVING', obrigatoria: true, regex: /\sHAVING\s/i, mensagem_faltando: 'Está faltando o HAVING!' },
      { clausula: 'ORDER BY', obrigatoria: true, regex: /\sORDER\s+BY\s/i, mensagem_faltando: 'Está faltando o ORDER BY!' },
      { clausula: 'AS', obrigatoria: false, regex: /\sAS\s/i, mensagem_faltando: 'Está faltando AS para renomear o total de minutos!' },
    ],
    dica: 'Una convidados com registros_tempo, filtre com WHERE sala_id = 1, use GROUP BY para agrupar por convidado, SUM com AS total_minutos para somar, HAVING para filtrar quem passou de 10 minutos, e ORDER BY total_minutos DESC para ordenar do maior para o menor.',
    resposta_comentada: `SELECT c.nome, SUM(r.minutos) AS total_minutos
FROM convidados c
INNER JOIN registros_tempo r ON c.id = r.convidado_id
WHERE r.sala_id = 1
GROUP BY c.id, c.nome
HAVING SUM(r.minutos) > 10
ORDER BY total_minutos DESC`,
    resumo_ferramenta: {
      titulo: 'GROUP BY, HAVING, ORDER BY e SUM',
      pontos: [
        'SUM(r.minutos) AS total_minutos, soma os minutos de cada grupo e dá um nome à coluna',
        'GROUP BY c.id, c.nome, agrupa as linhas por convidado',
        'HAVING SUM(r.minutos) > 10, filtra os grupos já formados (diferente do WHERE, que filtra antes de agrupar)',
        'ORDER BY total_minutos DESC, ordena o resultado do maior para o menor valor',
      ],
    },
    recap_fase_anterior: 'Na Fase 2, você descobriu que Carlos Menezes, Roberto Lima, Marcos Oliveira e Fernanda Costa estiveram na Biblioteca em algum momento da noite.',
    validacao: (resultado) => {
      const nomes = resultado.map((r) => (r as { nome: string }).nome);
      return nomes.includes('Roberto Lima') && nomes.includes('Marcos Oliveira') && nomes.length === 2;
    },
  },
  {
    id: 4,
    titulo: 'O Culpado',
    narrativa: `Restaram dois suspeitos com tempo suficiente perto da cena do crime: Roberto Lima e Marcos Oliveira.
    Você lembra que os horários de chegada de cada convidado foram registrados no início da investigação.
    Quem chegou depois das 19h naquela noite pode ter tido menos tempo para se preparar e mais pressa para agir.
    Cruze os dois suspeitos com o horário de chegada de cada um para descobrir o culpado.`,
    objetivo: 'Para cada convidado que esteve mais de 10 minutos na Biblioteca, mostre o nome (AS suspeito) e a hora de chegada (AS chegada). Use uma subconsulta no WHERE para filtrar apenas quem chegou depois das 19:00.',
    tabelas_disponiveis: ['convidados', 'registros_tempo', 'presencas'],
    schema: {
      convidados: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'nome', tipo: 'TEXT' },
        { coluna: 'relacao', tipo: 'TEXT' },
      ],
      registros_tempo: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'convidado_id', tipo: 'INTEGER' },
        { coluna: 'sala_id', tipo: 'INTEGER' },
        { coluna: 'minutos', tipo: 'REAL' },
        { coluna: 'data', tipo: 'TEXT' },
        { coluna: 'observacao', tipo: 'TEXT' },
      ],
      presencas: [
        { coluna: 'id', tipo: 'INTEGER' },
        { coluna: 'convidado_id', tipo: 'INTEGER' },
        { coluna: 'data', tipo: 'TEXT' },
        { coluna: 'hora_chegada', tipo: 'TEXT' },
        { coluna: 'hora_saida', tipo: 'TEXT' },
        { coluna: 'local', tipo: 'TEXT' },
      ],
    },
    formato_query: 'SELECT colunas AS nome\nFROM tabela1 alias1\nINNER JOIN tabela2 alias2 ON condição\nWHERE coluna IN (\n  SELECT coluna FROM tabela WHERE condição\n)',
    clausulas_esperadas: [
      { clausula: 'SELECT', obrigatoria: true, regex: /^SELECT\s/i, mensagem_faltando: 'Está faltando o SELECT!' },
      { clausula: 'FROM', obrigatoria: true, regex: /\sFROM\s/i, mensagem_faltando: 'Está faltando o FROM!' },
      { clausula: 'INNER JOIN', obrigatoria: true, regex: /\sINNER\s+JOIN\s/i, mensagem_faltando: 'Está faltando um INNER JOIN!' },
      { clausula: 'WHERE', obrigatoria: true, regex: /\sWHERE\s/i, mensagem_faltando: 'Está faltando o WHERE com a subconsulta!' },
      { clausula: 'subconsulta', obrigatoria: true, regex: /\(\s*SELECT/i, mensagem_faltando: 'Está faltando a subconsulta dentro do WHERE!' },
      { clausula: 'AS', obrigatoria: false, regex: /\sAS\s/i, mensagem_faltando: 'Está faltando AS para renomear nome e chegada!' },
    ],
    dica: "Una convidados com registros_tempo filtrando sala_id = 1. No WHERE, use c.id IN (SELECT convidado_id FROM presencas WHERE hora_chegada > '19:00').",
    resposta_comentada: `SELECT c.nome AS suspeito, p.hora_chegada AS chegada
FROM convidados c
INNER JOIN presencas p ON c.id = p.convidado_id
WHERE c.id IN (
  SELECT convidado_id FROM registros_tempo
  WHERE sala_id = 1
)
AND p.hora_chegada > '19:00'`,
    resumo_ferramenta: {
      titulo: 'Subconsultas',
      pontos: [
        'WHERE c.id IN (SELECT ...), a consulta entre parênteses roda primeiro e gera uma lista de ids',
        'A consulta de fora usa essa lista para filtrar suas próprias linhas',
        'Pode combinar subconsulta com INNER JOIN, WHERE e AS, tudo que já aprendeu',
      ],
    },
    recap_fase_anterior: 'Na Fase 3, você descobriu que Roberto Lima e Marcos Oliveira foram os dois que passaram mais tempo perto da Biblioteca, mais de 10 minutos cada um.',
    validacao: (resultado) => {
      if (resultado.length === 0) return false;
      const suspeitos = resultado.map((r) => (r as { suspeito: string }).suspeito);
      return suspeitos.includes('Marcos Oliveira') && resultado.length === 1;
    },
  },
];
