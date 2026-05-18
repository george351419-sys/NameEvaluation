const KEYS = {
  evaluations: "name__evaluations",
  companyEvaluations: "name__company_evaluations",
  namingEvaluations: "name__naming_evaluations",
} as const;

// ── 个人名字评测 ─────────────────────────────────────────

export interface StoredEvaluation {
  id: string;
  surname: string;
  givenName: string;
  birthDate: string;
  isLunar: boolean;
  zodiacOverride?: string;
  fatherSurname?: string;
  fatherZodiac?: string;
  motherSurname?: string;
  motherZodiac?: string;
  childZodiac?: string;
  createdAt: string;
}

function readAll<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return crypto.randomUUID();
}

export function saveEvaluation(data: Omit<StoredEvaluation, "id" | "createdAt">): string {
  const id = genId();
  const record: StoredEvaluation = { ...data, id, createdAt: new Date().toISOString() };
  const all = readAll<StoredEvaluation>(KEYS.evaluations);
  writeAll(KEYS.evaluations, [record, ...all]);
  return id;
}

export function getEvaluation(id: string): StoredEvaluation | null {
  return readAll<StoredEvaluation>(KEYS.evaluations).find((r) => r.id === id) ?? null;
}

export function listEvaluations(): StoredEvaluation[] {
  return readAll<StoredEvaluation>(KEYS.evaluations);
}

export function deleteEvaluation(id: string): void {
  writeAll(
    KEYS.evaluations,
    readAll<StoredEvaluation>(KEYS.evaluations).filter((r) => r.id !== id)
  );
}

// ── 公司名评测 ────────────────────────────────────────────

export interface StoredCompanyEvaluation {
  id: string;
  companyName: string;
  founderName: string;
  partnerNames: string[];
  createdAt: string;
}

export function saveCompanyEvaluation(
  data: Omit<StoredCompanyEvaluation, "id" | "createdAt">
): string {
  const id = genId();
  const record: StoredCompanyEvaluation = { ...data, id, createdAt: new Date().toISOString() };
  const all = readAll<StoredCompanyEvaluation>(KEYS.companyEvaluations);
  writeAll(KEYS.companyEvaluations, [record, ...all]);
  return id;
}

export function getCompanyEvaluation(id: string): StoredCompanyEvaluation | null {
  return (
    readAll<StoredCompanyEvaluation>(KEYS.companyEvaluations).find((r) => r.id === id) ?? null
  );
}

export function listCompanyEvaluations(): StoredCompanyEvaluation[] {
  return readAll<StoredCompanyEvaluation>(KEYS.companyEvaluations);
}

export function deleteCompanyEvaluation(id: string): void {
  writeAll(
    KEYS.companyEvaluations,
    readAll<StoredCompanyEvaluation>(KEYS.companyEvaluations).filter((r) => r.id !== id)
  );
}

// ── 起名建议 ──────────────────────────────────────────────

export interface StoredNamingEvaluation {
  id: string;
  surname: string;
  ownZodiac: string;
  fatherSurname: string;
  fatherZodiac?: string;
  motherSurname: string;
  motherZodiac: string;
  resultJson: string;
  createdAt: string;
}

export function saveNamingEvaluation(
  data: Omit<StoredNamingEvaluation, "id" | "createdAt">
): string {
  const id = genId();
  const record: StoredNamingEvaluation = { ...data, id, createdAt: new Date().toISOString() };
  const all = readAll<StoredNamingEvaluation>(KEYS.namingEvaluations);
  writeAll(KEYS.namingEvaluations, [record, ...all]);
  return id;
}

export function getNamingEvaluation(id: string): StoredNamingEvaluation | null {
  return (
    readAll<StoredNamingEvaluation>(KEYS.namingEvaluations).find((r) => r.id === id) ?? null
  );
}

export function listNamingEvaluations(): StoredNamingEvaluation[] {
  return readAll<StoredNamingEvaluation>(KEYS.namingEvaluations);
}

export function deleteNamingEvaluation(id: string): void {
  writeAll(
    KEYS.namingEvaluations,
    readAll<StoredNamingEvaluation>(KEYS.namingEvaluations).filter((r) => r.id !== id)
  );
}
