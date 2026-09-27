import * as SQLite from "expo-sqlite";
import type { HistoryEntry, TrustedContact } from "../types";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function db() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("deepfake.db").then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          autoAlert INTEGER NOT NULL DEFAULT 1,
          hasVoiceprint INTEGER NOT NULL DEFAULT 0,
          voiceprintHash TEXT
        );
        CREATE TABLE IF NOT EXISTS history (
          id TEXT PRIMARY KEY NOT NULL,
          phone TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          riskLevel TEXT NOT NULL,
          detectionType TEXT NOT NULL,
          matchedPattern TEXT,
          confidence REAL,
          category TEXT,
          reportCount INTEGER
        );
      `);
      return database;
    });
  }
  return dbPromise;
}

export async function listContacts(): Promise<TrustedContact[]> {
  const database = await db();

  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    phone: string;
    autoAlert: number;
    hasVoiceprint: number;
    voiceprintHash: string | null;
  }>("SELECT * FROM contacts ORDER BY name ASC");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    autoAlert: Boolean(row.autoAlert),
    hasVoiceprint: Boolean(row.hasVoiceprint),
    voiceprintHash: row.voiceprintHash ?? undefined,
  }));
}

export async function upsertContact(contact: TrustedContact) {
  const database = await db();
  await database.runAsync(
    `INSERT OR REPLACE INTO contacts (id, name, phone, autoAlert, hasVoiceprint, voiceprintHash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      contact.id,
      contact.name,
      contact.phone,
      contact.autoAlert ? 1 : 0,
      contact.hasVoiceprint ? 1 : 0,
      contact.voiceprintHash ?? null,
    ]
  );
}

export async function deleteContact(id: string) {
  const database = await db();
  await database.runAsync("DELETE FROM contacts WHERE id = ?", [id]);
}

export async function listHistory(): Promise<HistoryEntry[]> {
  const database = await db();
  return database.getAllAsync<HistoryEntry>(
    "SELECT * FROM history ORDER BY timestamp DESC"
  );
}

export async function insertHistory(entry: HistoryEntry) {
  const database = await db();
  await database.runAsync(
    `INSERT OR REPLACE INTO history
     (id, phone, timestamp, riskLevel, detectionType, matchedPattern, confidence, category, reportCount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.phone,
      entry.timestamp,
      entry.riskLevel,
      entry.detectionType,
      entry.matchedPattern ?? null,
      entry.confidence ?? null,
      entry.category ?? null,
      entry.reportCount ?? null,
    ]
  );
}

export async function historyStats() {
  const items = await listHistory();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const checkedThisWeek = items.filter((item) => item.timestamp >= weekAgo).length;
  const threatsBlocked = items.filter(
    (item) => item.riskLevel === "high" || item.riskLevel === "medium"
  ).length;
  return { checkedThisWeek, threatsBlocked, recent: items.slice(0, 5) };
}

