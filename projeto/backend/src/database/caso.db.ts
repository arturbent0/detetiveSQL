import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const CASO_DB_PATH = path.join(__dirname, '../../caso.db');
const PROGRESSO_DB_PATH = path.join(__dirname, '../../progresso.db');

let SQL: initSqlJs.SqlJsStatic | null = null;
let progressoDbInstance: SqlJsDatabase | null = null;

async function getSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getCasoDb(): Promise<SqlJsDatabase> {
  const sql = await getSQL();
  const buffer = fs.readFileSync(CASO_DB_PATH);
  return new sql.Database(buffer);
}

export async function getProgressoDb(): Promise<SqlJsDatabase> {
  const sql = await getSQL();

  if (progressoDbInstance) return progressoDbInstance;

  if (fs.existsSync(PROGRESSO_DB_PATH)) {
    const buffer = fs.readFileSync(PROGRESSO_DB_PATH);
    progressoDbInstance = new sql.Database(buffer);
  } else {
    progressoDbInstance = new sql.Database();
    progressoDbInstance.run(`
      CREATE TABLE sessoes (
        id TEXT PRIMARY KEY,
        fase_atual INTEGER DEFAULT 1,
        criada_em TEXT DEFAULT (datetime('now')),
        atualizada_em TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE tentativas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessao_id TEXT NOT NULL,
        fase INTEGER NOT NULL,
        query TEXT NOT NULL,
        correta INTEGER NOT NULL DEFAULT 0,
        numero_tentativa INTEGER NOT NULL,
        criada_em TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (sessao_id) REFERENCES sessoes(id)
      );
    `);
    persistProgressoDb();
  }

  return progressoDbInstance;
}

export function persistProgressoDb() {
  if (!progressoDbInstance) return;
  const data = progressoDbInstance.export();
  fs.writeFileSync(PROGRESSO_DB_PATH, Buffer.from(data));
}

export function rowsToObjects(stmt: ReturnType<SqlJsDatabase['prepare']>): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}
