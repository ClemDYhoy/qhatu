// src/scripts/localizeProductImages.js
//
// Descarga las imágenes de producto a frontend/public/products y actualiza
// productos.url_imagen a la ruta local ("/products/<id>.<ext>").
// Si una imagen no se puede descargar o no es una imagen válida, se deja
// apuntando al placeholder "/awaiting-image.jpeg".
//
// Uso:
//   node src/scripts/localizeProductImages.js            -> aplica cambios
//   node src/scripts/localizeProductImages.js --dry-run  -> solo muestra qué haría

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../frontend/public/products');
const PLACEHOLDER = '/awaiting-image.jpeg';

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qhatu_db'
};

const downloadImage = async (url) => {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Accept': 'image/*,*/*;q=0.8'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = EXT_BY_TYPE[contentType];

  if (!ext) {
    throw new Error(`content-type no es imagen: ${contentType || '(vacío)'}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 200) {
    throw new Error(`archivo demasiado pequeño (${buffer.length} bytes)`);
  }

  return { buffer, ext, contentType };
};

const run = async () => {
  const dryRun = process.argv.includes('--dry-run');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const conn = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await conn.query(
      'SELECT producto_id, nombre, url_imagen FROM productos ORDER BY producto_id'
    );

    let ok = 0;
    let placeholder = 0;
    let skipped = 0;

    for (const row of rows) {
      const url = row.url_imagen;

      if (!url || url.startsWith('/')) {
        console.log(`• #${row.producto_id} ya es local o vacío: ${url || '(vacío)'}`);
        skipped++;
        continue;
      }

      try {
        const { buffer, ext } = await downloadImage(url);
        const filename = `${row.producto_id}.${ext}`;
        const localUrl = `/products/${filename}`;

        if (!dryRun) {
          fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
          await conn.query('UPDATE productos SET url_imagen = ? WHERE producto_id = ?', [localUrl, row.producto_id]);
        }
        console.log(`✅ #${row.producto_id} ${row.nombre} -> ${localUrl} (${ext}, ${Math.round(buffer.length / 1024)} KB)`);
        ok++;
      } catch (error) {
        console.log(`⚠️  #${row.producto_id} no descargable (${error.message}) -> ${PLACEHOLDER}`);
        if (!dryRun) {
          await conn.query('UPDATE productos SET url_imagen = ? WHERE producto_id = ?', [PLACEHOLDER, row.producto_id]);
        }
        placeholder++;
      }
    }

    console.log('\n──────────────────────────────');
    console.log(`Locales: ${ok} | Placeholder: ${placeholder} | Omitidos: ${skipped}`);
    console.log(dryRun ? '(dry-run: no se aplicó ningún cambio)' : `Imágenes en: ${OUT_DIR}`);
  } finally {
    await conn.end();
  }
};

run().catch((error) => {
  console.error('\n❌ Error localizando imágenes:', error.message);
  process.exit(1);
});
