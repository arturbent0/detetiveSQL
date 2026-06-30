import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE convidados (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      relacao TEXT NOT NULL
    );

    CREATE TABLE presencas (
      id INTEGER PRIMARY KEY,
      convidado_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      hora_chegada TEXT NOT NULL,
      hora_saida TEXT NOT NULL,
      local TEXT NOT NULL,
      FOREIGN KEY (convidado_id) REFERENCES convidados(id)
    );

    CREATE TABLE salas (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      andar TEXT NOT NULL
    );

    CREATE TABLE visitas_sala (
      id INTEGER PRIMARY KEY,
      convidado_id INTEGER NOT NULL,
      sala_id INTEGER NOT NULL,
      ocasiao TEXT NOT NULL,
      FOREIGN KEY (convidado_id) REFERENCES convidados(id),
      FOREIGN KEY (sala_id) REFERENCES salas(id)
    );

    CREATE TABLE registros_tempo (
      id INTEGER PRIMARY KEY,
      convidado_id INTEGER NOT NULL,
      sala_id INTEGER NOT NULL,
      minutos REAL NOT NULL,
      data TEXT NOT NULL,
      observacao TEXT NOT NULL,
      FOREIGN KEY (convidado_id) REFERENCES convidados(id),
      FOREIGN KEY (sala_id) REFERENCES salas(id)
    );

    INSERT INTO convidados VALUES
      (1, 'Carlos Menezes', 'Sobrinho'),
      (2, 'Ana Souza', 'Vizinha'),
      (3, 'Roberto Lima', 'Sócio de negócios'),
      (4, 'Fernanda Costa', 'Governanta'),
      (5, 'Marcos Oliveira', 'Filho'),
      (6, 'Patricia Alves', 'Amiga da família'),
      (7, 'Diego Santos', 'Jardineiro');

    INSERT INTO presencas VALUES
      (1, 1, '2024-03-15', '19:00', '23:30', 'Mansão Belmont'),
      (2, 2, '2024-03-15', '20:00', '22:00', 'Mansão Belmont'),
      (3, 3, '2024-03-15', '18:45', '23:50', 'Mansão Belmont'),
      (4, 4, '2024-03-15', '14:00', '23:59', 'Mansão Belmont'),
      (5, 5, '2024-03-15', '19:15', '23:40', 'Mansão Belmont'),
      (6, 6, '2024-03-14', '19:00', '21:00', 'Mansão Belmont'),
      (7, 7, '2024-03-15', '08:00', '17:00', 'Jardim Externo');

    INSERT INTO salas VALUES
      (1, 'Biblioteca', 'Térreo'),
      (2, 'Salão de Festas', 'Térreo'),
      (3, 'Cozinha', 'Térreo'),
      (4, 'Jardim de Inverno', 'Térreo'),
      (5, 'Escritório', '1º Andar');

    INSERT INTO visitas_sala VALUES
      (1, 1, 1, 'Durante o jantar'),
      (2, 3, 1, 'Durante o jantar'),
      (3, 5, 1, 'Durante o jantar'),
      (4, 4, 1, 'Limpeza da tarde'),
      (5, 1, 2, 'Após o jantar'),
      (6, 3, 2, 'Após o jantar'),
      (7, 5, 5, 'Antes do jantar'),
      (8, 2, 2, 'Durante o jantar'),
      (9, 4, 3, 'Durante o jantar');

    INSERT INTO registros_tempo VALUES
      (1, 1, 1, 8, '2024-03-15', 'Câmera de corredor'),
      (2, 3, 1, 12, '2024-03-15', 'Câmera de corredor'),
      (3, 5, 1, 35, '2024-03-15', 'Câmera de corredor'),
      (4, 1, 2, 90, '2024-03-15', 'Câmera do salão'),
      (5, 3, 2, 95, '2024-03-15', 'Câmera do salão'),
      (6, 5, 1, 14, '2024-03-15', 'Câmera de corredor'),
      (7, 4, 1, 4, '2024-03-15', 'Câmera de corredor');
  `);

  const data = db.export();
  const outPath = path.join(__dirname, '../../caso.db');
  fs.writeFileSync(outPath, Buffer.from(data));

  console.log('Banco de dados do caso criado com sucesso em', outPath);
  db.close();
}

seed();
