import path from 'node:path';
import fs from 'node:fs';

let dbInstance: any = null;

export function getDatabase(): any {
  if (dbInstance) return dbInstance;

  try {
    // Dynamically require node:sqlite to support both dev, test, and build
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatabaseSync } = require('node:sqlite');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'brightloop.sqlite');
    dbInstance = new DatabaseSync(dbPath);

    // Initialize Schema
    dbInstance.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS records (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (collection, id)
      );
      CREATE INDEX IF NOT EXISTS idx_records_collection ON records(collection);
      CREATE TABLE IF NOT EXISTS idempotency_ledger (
        cycle_key TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        ledger_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    return dbInstance;
  } catch (err) {
    console.warn('[SQLite] node:sqlite fallback to memory mode:', err);
    return null;
  }
}

export function saveRecord(collection: string, id: string, data: any): void {
  const db = getDatabase();
  if (!db) return;
  try {
    const stmt = db.prepare(`
      INSERT INTO records (collection, id, data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(collection, id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
    `);
    stmt.run(collection, id, JSON.stringify(data), new Date().toISOString());
  } catch (err) {
    console.error(`[SQLite] Error saving record to ${collection}/${id}:`, err);
  }
}

export function loadAllRecords<T = any>(collection: string): T[] {
  const db = getDatabase();
  if (!db) return [];
  try {
    const stmt = db.prepare('SELECT data FROM records WHERE collection = ?');
    const rows = stmt.all(collection) as Array<{ data: string }>;
    return rows.map((r) => JSON.parse(r.data));
  } catch (err) {
    console.error(`[SQLite] Error loading collection ${collection}:`, err);
    return [];
  }
}

export function countRecords(collection: string): number {
  const db = getDatabase();
  if (!db) return 0;
  try {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM records WHERE collection = ?');
    const row = stmt.get(collection) as { cnt: number };
    return row ? row.cnt : 0;
  } catch (err) {
    return 0;
  }
}

export function saveLedgerEntry(cycleKey: string, invoiceId: string, ledgerHash: string): void {
  const db = getDatabase();
  if (!db) return;
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO idempotency_ledger (cycle_key, invoice_id, ledger_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(cycleKey, invoiceId, ledgerHash, new Date().toISOString());
  } catch (err) {
    console.error('[SQLite] Error saving ledger entry:', err);
  }
}
