import express from 'express';
import cors from 'cors';
import { executarQuery } from './query/query.service';
import { fases } from './fase/fases.data';
import {
  criarSessao,
  getSessao,
  registrarTentativa,
  getProgresso,
  getNumTentativas,
} from './progresso/progresso.service';

const app = express();
app.use(cors());
app.use(express.json());

// ---- Sessão ----
app.post('/sessao', async (_req, res) => {
  const id = await criarSessao();
  res.json({ sessao_id: id });
});

app.get('/sessao/:id', async (req, res) => {
  const sessao = await getSessao(req.params.id);
  if (!sessao) return res.status(404).json({ erro: 'Sessão não encontrada.' });
  return res.json(sessao);
});

// ---- Fases ----
app.get('/fase/:id', (req, res) => {
  const fase = fases.find((f) => f.id === Number(req.params.id));
  if (!fase) return res.status(404).json({ erro: 'Fase não encontrada.' });

  const { validacao, clausulas_esperadas, ...fasePublica } = fase;
  void validacao;
  void clausulas_esperadas;
  return res.json(fasePublica);
});

// ---- Query ----
app.post('/query', async (req, res) => {
  const { sql, fase_id, sessao_id } = req.body as {
    sql: string;
    fase_id: number;
    sessao_id: string;
  };

  if (!sql || !fase_id || !sessao_id) {
    return res.status(400).json({ erro: 'sql, fase_id e sessao_id são obrigatórios.' });
  }

  const sessao = await getSessao(sessao_id);
  if (!sessao) return res.status(404).json({ erro: 'Sessão não encontrada.' });

  const numTentativa = (await getNumTentativas(sessao_id, fase_id)) + 1;
  const resultado = await executarQuery(sql, fase_id, numTentativa);

  if (resultado.sucesso) {
    await registrarTentativa(sessao_id, fase_id, sql, resultado.correta ?? false, numTentativa);
  }

  return res.json({ ...resultado, num_tentativa: numTentativa });
});

// ---- Progresso ----
app.get('/progresso/:sessao_id', async (req, res) => {
  const progresso = await getProgresso(req.params.sessao_id);
  if (!progresso) return res.status(404).json({ erro: 'Sessão não encontrada.' });
  return res.json(progresso);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
