# Detetive SQL

Projeto da disciplina de Objetos de Aprendizagem

## Descrição do Projeto

O Detetive SQL é um Objeto de Aprendizagem desenvolvido com o intuito de ensinar consultas SQL por meio de um jogo investigativo. O aluno assume o papel de um detetive que precisa resolver um assassinato na Mansão Belmont, utilizando consultas SQL para cruzar evidências, filtrar suspeitos e chegar a uma conclusão baseada em dados concretos.

O projeto consiste em um backend construído com Express e SQLite, que fornece uma API RESTful para gerenciar as fases do caso, executar consultas SQL em um banco de dados fictício e registrar o progresso do jogador por sessão.

## Objeto de Aprendizagem

O objeto de aprendizagem a ser produzido é um jogo investigativo interativo sobre consultas SQL, destinado a estudantes de ensino médio e início do ensino superior que estão tendo o primeiro contato com bancos de dados relacionais. O objetivo é ensinar as principais cláusulas SQL de forma progressiva e contextualizada, onde cada nova ferramenta é apresentada junto com o caso que ela ajuda a resolver.

## Público-Alvo

Este objeto de aprendizagem é destinado a estudantes jovens (ensino médio e início do ensino superior) com pouco ou nenhum conhecimento prévio em SQL.

## Mapa Conceitual

O Mapa Conceitual do Objeto de Aprendizagem pode ser visualizado [aqui](https://cmapscloud.ihmc.us/viewer/cmap/22NYLDRG0-2DKBHS1-MQPG10)

## Modelo Instrucional

O Modelo Instrucional do Objeto de Aprendizagem pode ser visualizado [aqui](https://drive.google.com/file/d/1vsp7qfLwGq4v5txu56DdbRVqLkJIdaVI/view?usp=sharing)

## Requisitos de Aprendizagem

| # | Objetivo | Nível Bloom | Avaliação no Jogo |
|---|----------|-------------|-------------------|
| 1 | Compreender conceitos fundamentais de banco de dados | **Entender** | Leitura do schema de tabelas e identificação de colunas relevantes |
| 2 | Aplicar consultas SQL para investigação | **Aplicar** | Execução de consultas SQL para filtrar e obter pistas |
| 3 | Analisar dados para identificar padrões e inconsistências | **Analisar** | Comparação de dados entre tabelas com JOIN e GROUP BY |
| 4 | Avaliar hipóteses com base em evidências | **Avaliar** | Eliminação de suspeitos por meio de subconsultas e filtros cruzados |
| 5 | Criar consultas completas para resolver o caso | **Criar** | Construção autônoma da consulta final que aponta o culpado |

## Estrutura do Repositório

```
projeto/
├── frontend/   # Next.js + TypeScript + Tailwind CSS
└── backend/    # Express + TypeScript + sql.js (SQLite)
```

## Pré-requisitos

- Node.js 18+
- npm

## Instalação e Execução

### Backend

```bash
cd backend
npm install
npm run seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:3001`.

Nenhuma alteração nas variáveis de ambiente é necessária para rodar localmente.

## Tecnologias

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, CodeMirror 6

**Backend:** Express, TypeScript, sql.js (SQLite via WebAssembly)

## Fluxo do Jogo

1. Página inicial
2. Abertura — apresentação do caso e do banco de dados
3. Fase 1: A Noite do Crime — SELECT, FROM e WHERE
4. Fase 2: Quem Esteve na Biblioteca — INNER JOIN e AS
5. Fase 3: Tempo na Cena do Crime — GROUP BY, HAVING, ORDER BY e SUM
6. Fase 4: O Culpado — Subconsultas
7. Encerramento com veredito e desempenho por fase
