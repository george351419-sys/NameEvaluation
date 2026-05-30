import { createCollection, type StoreRecord } from "./store";

// ============================================================
// 替代 Prisma 的数据库层 — 基于 JSON 文件存储
// 接口完全兼容原 Prisma 调用方式
// ============================================================

// ---------- 类型定义（对应原 Prisma schema）----------

export interface EvaluationRecord extends StoreRecord {
  name: string;
  surname: string;
  givenName: string;
  nameFirst: string;
  nameLast: string;
  birthDate: string;
  isLunar: boolean;
  zodiacOverride: string | null;
  fatherSurname: string | null;
  fatherZodiac: string | null;
  motherSurname: string | null;
  motherZodiac: string | null;
  childZodiac: string | null;
  resultJson: string;
  interpretation: string | null;
}

export interface CompanyEvaluationRecord extends StoreRecord {
  companyName: string;
  founderName: string;
  founderZodiac: string | null;
  partnerNames: string;
  resultJson: string;
  interpretation: string | null;
}

export interface NamingEvaluationRecord extends StoreRecord {
  surname: string;
  ownZodiac: string;
  fatherSurname: string;
  fatherZodiac: string | null;
  motherSurname: string;
  motherZodiac: string;
  resultJson: string;
}

// ---------- Collection 实例 ----------

const evaluations = createCollection<EvaluationRecord>("evaluations");
const companyEvaluations =
  createCollection<CompanyEvaluationRecord>("companyEvaluations");
const namingEvaluations =
  createCollection<NamingEvaluationRecord>("namingEvaluations");

// ---------- 辅助类型 ----------

type CreateData<T extends StoreRecord> = Partial<
  Omit<T, "id" | "createdAt" | "updatedAt">
> & Record<string, unknown>;

// ---------- Prisma 兼容接口 ----------

export const prisma = {
  evaluation: {
    findUnique: ({ where: { id } }: { where: { id: string } }) =>
      evaluations.findUnique(id),

    findMany: (opts?: {
      orderBy?: { createdAt?: "asc" | "desc" };
      select?: Record<string, boolean>;
    }) => {
      const orderBy = opts?.orderBy
        ? { createdAt: opts.orderBy.createdAt ?? "desc" as const }
        : undefined;
      // 忽略 select，直接返回完整记录
      return evaluations.findMany({ orderBy }) as EvaluationRecord[];
    },

    create: ({ data }: { data: CreateData<EvaluationRecord> }) =>
      evaluations.create(data as Omit<EvaluationRecord, "id" | "createdAt" | "updatedAt">),

    delete: ({ where: { id } }: { where: { id: string } }) =>
      evaluations.delete(id),
  },

  companyEvaluation: {
    findUnique: ({ where: { id } }: { where: { id: string } }) =>
      companyEvaluations.findUnique(id),

    findMany: (opts?: {
      orderBy?: { createdAt?: "asc" | "desc" };
      select?: Record<string, boolean>;
    }) => {
      const orderBy = opts?.orderBy
        ? { createdAt: opts.orderBy.createdAt ?? "desc" as const }
        : undefined;
      return companyEvaluations.findMany({ orderBy }) as CompanyEvaluationRecord[];
    },

    create: ({ data }: { data: CreateData<CompanyEvaluationRecord> }) =>
      companyEvaluations.create(
        data as Omit<CompanyEvaluationRecord, "id" | "createdAt" | "updatedAt">
      ),

    update: ({
      where: { id },
      data,
    }: {
      where: { id: string };
      data: Partial<
        Omit<CompanyEvaluationRecord, "id" | "createdAt" | "updatedAt">
      >;
    }) => companyEvaluations.update(id, data),

    delete: ({ where: { id } }: { where: { id: string } }) =>
      companyEvaluations.delete(id),
  },

  namingEvaluation: {
    findUnique: ({ where: { id } }: { where: { id: string } }) =>
      namingEvaluations.findUnique(id),

    findMany: (opts?: {
      orderBy?: { createdAt?: "asc" | "desc" };
      select?: Record<string, boolean>;
    }) => {
      const orderBy = opts?.orderBy
        ? { createdAt: opts.orderBy.createdAt ?? "desc" as const }
        : undefined;
      return namingEvaluations.findMany({ orderBy }) as NamingEvaluationRecord[];
    },

    create: ({ data }: { data: CreateData<NamingEvaluationRecord> }) =>
      namingEvaluations.create(
        data as Omit<NamingEvaluationRecord, "id" | "createdAt" | "updatedAt">
      ),

    delete: ({ where: { id } }: { where: { id: string } }) =>
      namingEvaluations.delete(id),
  },
};
