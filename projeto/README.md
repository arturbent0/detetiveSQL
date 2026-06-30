# Detetive SQL

Objeto de Aprendizagem baseado em um jogo investigativo onde o aluno assume o papel de um detetive que resolve casos utilizando consultas SQL e análise de dados.

## Estrutura do Repositório

```
detetive-sql/
├── frontend/   # Next.js + TypeScript + Tailwind CSS
└── backend/    # Express + TypeScript + SQLite (better-sqlite3)
```

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação e execução

### Backend

```bash
cd backend
npm install
npm run seed       # cria o banco de dados fictício do caso
npm run start:dev  # inicia o servidor na porta 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # inicia o servidor na porta 3000
```

## Variáveis de ambiente

### Frontend — `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Tecnologias

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, CodeMirror 6

**Backend:** Express, TypeScript, better-sqlite3

## Fluxo do jogo

1. Página inicial
2. Abertura — apresentação do caso
3. Tutorial SELECT → Fase 1: A Cena do Crime
4. Tutorial JOIN → Fase 2: Rastreando os Suspeitos
5. Tutorial GROUP BY → Fase 3: Seguindo o Dinheiro
6. Tutorial Subconsultas → Fase 4: O Veredito Final
7. Encerramento com desempenho por fase
