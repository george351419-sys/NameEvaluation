import fs from "node:fs";
import path from "node:path";

// ============================================================
// 简易 JSON 文件存储 — 兼容 Netlify serverless 环境
// 替代 Prisma + SQLite，无需外部数据库服务
// ============================================================

const DATA_DIR = process.env.NETLIFY
  ? "/tmp/data"
  : path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCollection<T>(name: string): T[] {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(name: string, data: T[]) {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ============================================================
// 通用 CRUD
// ============================================================

export interface StoreRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

function now() {
  return new Date().toISOString();
}

function createRecord<T extends StoreRecord>(
  collection: string,
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): T {
  const records = readCollection<T>(collection);
  const record = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now(),
    updatedAt: now(),
  } as unknown as T;
  records.push(record);
  writeCollection(collection, records);
  return record;
}

function findUnique<T extends StoreRecord>(
  collection: string,
  id: string
): T | null {
  const records = readCollection<T>(collection);
  return records.find((r) => r.id === id) ?? null;
}

function findMany<T extends StoreRecord>(
  collection: string,
  opts?: {
    orderBy?: { [key: string]: "asc" | "desc" };
    select?: Record<string, boolean>;
  }
): Partial<T>[] {
  let records = readCollection<T>(collection);

  // 排序
  if (opts?.orderBy) {
    const [key, dir] = Object.entries(opts.orderBy)[0];
    records.sort((a, b) => {
      const va = (a as any)[key] ?? "";
      const vb = (b as any)[key] ?? "";
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  // select 字段过滤
  if (opts?.select) {
    const fields = Object.keys(opts.select);
    return records.map((r) => {
      const picked: any = {};
      for (const f of fields) {
        picked[f] = (r as any)[f];
      }
      return picked;
    });
  }

  return records;
}

function updateRecord<T extends StoreRecord>(
  collection: string,
  id: string,
  data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
): T | null {
  const records = readCollection<T>(collection);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...data, updatedAt: now() };
  writeCollection(collection, records);
  return records[idx];
}

function deleteRecord(collection: string, id: string) {
  const records = readCollection(collection);
  writeCollection(
    collection,
    records.filter((r: any) => r.id !== id)
  );
}

// ============================================================
// Collection 工厂
// ============================================================

export function createCollection<T extends StoreRecord>(name: string) {
  return {
    create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) =>
      createRecord<T>(name, data),
    findUnique: (id: string) => findUnique<T>(name, id),
    findMany: (opts?: {
      orderBy?: { [key: string]: "asc" | "desc" };
      select?: Record<string, boolean>;
    }) => findMany<T>(name, opts),
    update: (id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>) =>
      updateRecord<T>(name, id, data),
    delete: (id: string) => deleteRecord(name, id),
  };
}
