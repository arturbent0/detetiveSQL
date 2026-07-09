export interface ColunasSchema {
  coluna: string;
  tipo: string;
}

export interface FaseData {
  id: number;
  titulo: string;
  narrativa: string;
  objetivo: string;
  tabelas_disponiveis: string[];
  schema: Record<string, ColunasSchema[]>;
  formato_query: string;
  dicas: string[];
  resposta_comentada: string;
  resumo_ferramenta: { titulo: string; pontos: string[] };
  recap_fase_anterior?: string;
}

export interface QueryResponse {
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

export interface ProgressoFase {
  acertos: number;
  tentativas: number;
}

export interface Progresso {
  sessao: { id: string; fase_atual: number };
  porFase: Record<number, ProgressoFase>;
}

export const TUTORIAIS = {
  1: {
    titulo: 'A ferramenta: SELECT, FROM e WHERE',
    topicos: [
      {
        subtitulo: 'O que é uma consulta SQL?',
        texto: 'Uma consulta SQL é uma instrução que você escreve para buscar informações de um banco de dados. Pense nela como uma pergunta que você faz para o banco de dados responder.',
      },
      {
        subtitulo: 'SELECT, o que você quer ver',
        texto: 'O SELECT define quais colunas aparecerão no resultado. Você pode listar colunas específicas ou usar * para trazer todas.',
        exemplo: 'SELECT nome, relacao\nFROM convidados',
        resultado: [
          { nome: 'Carlos Menezes', relacao: 'Sobrinho' },
          { nome: 'Ana Souza', relacao: 'Vizinha' },
        ],
      },
      {
        subtitulo: 'FROM, de qual tabela',
        texto: 'O FROM indica em qual tabela os dados estão. É obrigatório em toda consulta.',
      },
      {
        subtitulo: 'WHERE, filtrar as linhas',
        texto: 'O WHERE filtra quais linhas aparecem no resultado. Use operadores como =, >, < e combine condições com AND e OR.',
        exemplo: "SELECT nome, relacao\nFROM convidados\nWHERE relacao = 'Filho'",
        resultado: [
          { nome: 'Marcos Oliveira', relacao: 'Filho' },
        ],
      },
    ],
  },
  2: {
    titulo: 'A ferramenta: JOIN',
    topicos: [
      {
        subtitulo: 'Por que precisamos do JOIN?',
        texto: 'Às vezes os dados que você precisa estão em tabelas diferentes. O JOIN une essas tabelas em um único resultado, usando uma coluna em comum entre elas.',
      },
      {
        subtitulo: 'Apelidos de tabela, alias',
        texto: 'Quando juntamos tabelas, é comum dar um apelido curto para cada uma, para não precisar escrever o nome completo toda hora. O apelido vem logo depois do nome da tabela, sem vírgula. Depois disso, usamos "apelido.coluna" para indicar de qual tabela é cada coluna.',
        exemplo: 'SELECT c.nome, v.ocasiao\nFROM convidados c\nINNER JOIN visitas_sala v ON c.id = v.convidado_id',
      },
      {
        subtitulo: 'A condição do JOIN, ON',
        texto: 'O ON indica como as duas tabelas se conectam. Aqui, c.id é o id do convidado na tabela convidados, e v.convidado_id é a coluna na tabela visitas_sala que guarda esse mesmo id. O ON diz: junte o convidado com a visita cujo convidado_id é igual ao id dele.',
      },
      {
        subtitulo: 'INNER JOIN, apenas correspondências',
        texto: 'O INNER JOIN retorna apenas as linhas que têm correspondência nas duas tabelas. Se um convidado não tiver visitado nenhuma sala, ele não aparece no resultado.',
        exemplo: 'SELECT c.nome, v.ocasiao\nFROM convidados c\nINNER JOIN visitas_sala v ON c.id = v.convidado_id',
        resultado: [
          { nome: 'Carlos Menezes', ocasiao: 'Durante o jantar' },
          { nome: 'Roberto Lima', ocasiao: 'Durante o jantar' },
        ],
      },
      {
        subtitulo: 'AS, dando um nome melhor para a coluna',
        texto: 'O AS não muda nada no banco de dados, ele só renomeia a coluna apenas para exibição no resultado. É útil porque nomes como "v.ocasiao" ficam confusos numa tabela, com AS você troca por algo mais legível, como "visita".',
        exemplo: 'SELECT c.nome, v.ocasiao AS visita\nFROM convidados c\nINNER JOIN visitas_sala v ON c.id = v.convidado_id',
        resultado: [
          { nome: 'Carlos Menezes', visita: 'Durante o jantar' },
          { nome: 'Roberto Lima', visita: 'Durante o jantar' },
        ],
      },
    ],
  },
  3: {
    titulo: 'A ferramenta: GROUP BY, HAVING, ORDER BY e funções de agregação',
    topicos: [
      {
        subtitulo: 'Funções de agregação',
        texto: 'Funções de agregação calculam um valor a partir de um grupo de linhas. As principais são COUNT (conta), SUM (soma), AVG (média), MAX (maior) e MIN (menor).',
        exemplo: 'SELECT SUM(minutos) AS total\nFROM registros_tempo',
        resultado: [{ total: 100 }],
      },
      {
        subtitulo: 'GROUP BY, agrupando linhas',
        texto: 'O GROUP BY agrupa as linhas que têm o mesmo valor em uma coluna, e a função de agregação é aplicada dentro de cada grupo separadamente. Aqui, cada convidado_id forma um grupo, e SUM(minutos) soma os valores só daquele grupo.',
        exemplo: 'SELECT convidado_id, SUM(minutos) AS total\nFROM registros_tempo\nGROUP BY convidado_id',
        resultado: [
          { convidado_id: 3, total: 12 },
          { convidado_id: 5, total: 49 },
        ],
      },
      {
        subtitulo: 'HAVING, filtrando grupos',
        texto: 'O HAVING filtra os grupos depois que eles já foram formados pelo GROUP BY. É como o WHERE, mas funciona sobre o resultado da agregação, não sobre as linhas originais. Por isso HAVING vem depois do GROUP BY, e WHERE vem antes.',
        exemplo: 'SELECT convidado_id, SUM(minutos) AS total\nFROM registros_tempo\nGROUP BY convidado_id\nHAVING SUM(minutos) > 10',
        resultado: [{ convidado_id: 5, total: 49 }],
      },
      {
        subtitulo: 'ORDER BY, ordenando o resultado',
        texto: 'O ORDER BY ordena as linhas do resultado por uma coluna. Use ASC para ordem crescente (do menor para o maior, é o padrão se não escrever nada) ou DESC para ordem decrescente (do maior para o menor).',
        exemplo: 'SELECT convidado_id, SUM(minutos) AS total\nFROM registros_tempo\nGROUP BY convidado_id\nORDER BY total DESC',
        resultado: [
          { convidado_id: 5, total: 49 },
          { convidado_id: 3, total: 12 },
        ],
      },
    ],
  },
  4: {
    titulo: 'A ferramenta: Subconsultas',
    topicos: [
      {
        subtitulo: 'O que é uma subconsulta?',
        texto: 'Uma subconsulta é uma consulta SQL dentro de outra consulta. O resultado da subconsulta é usado pela consulta externa. É como resolver um problema em duas etapas: primeiro você descobre uma lista de ids, depois usa essa lista para filtrar a consulta principal.',
      },
      {
        subtitulo: 'Subconsulta no WHERE',
        texto: 'A forma mais comum: a subconsulta entre parênteses retorna uma lista de valores, e o IN verifica se o id da linha está nessa lista.',
        exemplo: "SELECT nome FROM convidados\nWHERE id IN (\n  SELECT convidado_id FROM registros_tempo\n  WHERE sala_id = 1\n)",
        resultado: [
          { nome: 'Roberto Lima' },
          { nome: 'Marcos Oliveira' },
        ],
      },
    ],
  },
};
