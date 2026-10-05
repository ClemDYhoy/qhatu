// src/scripts/migrate.js
// Runner de migraciones SQL versionadas.
//
// Uso:
//   node src/scripts/migrate.js            -> aplica las migraciones pendientes
//   node src/scripts/migrate.js --dry-run  -> solo muestra qué se aplicaría
//   node src/scripts/migrate.js --status   -> estado de las migraciones
//
// Las migraciones viven en backend/db/migrations/*.sql ordenadas por nombre.
// Cada migración aplicada se registra en la tabla `schema_migrations`.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../db/migrations');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qhatu_db',
  multipleStatements: true
};

const ensureMigrationsTable = async (conn) => {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

const getAppliedMigrations = async (conn) => {
  const [rows] = await conn.query('SELECT filename FROM schema_migrations ORDER BY filename');
  return new Set(rows.map((r) => r.filename));
};

const listMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
};

const showStatus = async (conn) => {
  const applied = await getAppliedMigrations(conn);
  const files = listMigrationFiles();

  console.log('\n📋 Estado de migraciones:\n');
  if (files.length === 0) {
    console.log('   (no hay archivos .sql en db/migrations)\n');
    return;
  }

  files.forEach((file) => {
    const mark = applied.has(file) ? '✅ aplicada' : '⏳ pendiente';
    console.log(`   ${mark}  ${file}`);
  });
  console.log('');
};

const run = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const statusOnly = process.argv.includes('--status');

  const files = listMigrationFiles();
  const conn = await mysql.createConnection(dbConfig);

  try {
    await ensureMigrationsTable(conn);

    if (statusOnly) {
      await showStatus(conn);
      return;
    }

    const applied = await getAppliedMigrations(conn);
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('\n✅ No hay migraciones pendientes.\n');
      return;
    }

    console.log(`\n🚀 Migraciones pendientes: ${pending.length}\n`);

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      if (dryRun) {
        console.log(`   [dry-run] ${file}`);
        continue;
      }

      console.log(`   ⏳ Aplicando ${file}...`);
      await conn.query(sql);
      await conn.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log(`   ✅ ${file}`);
    }

    console.log(dryRun ? '\n(dry-run: no se aplicó ningún cambio)\n' : '\n✅ Migraciones aplicadas correctamente.\n');
  } finally {
    await conn.end();
  }
};

run().catch((error) => {
  console.error('\n❌ Error ejecutando migraciones:');
  console.error(`   ${error.message}\n`);
  process.exit(1);
});
