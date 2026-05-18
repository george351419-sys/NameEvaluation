# 纯前端静态导出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Next.js 全栈项目转为纯静态前端，新建 `name-static/` 文件夹，`npm run build` 后生成可直接上传的 `out/` 静态文件。

**Architecture:** 复制 `app/` 到 `name-static/`，开启 Next.js `output: 'export'`。删除所有 API 路由和 Prisma；计算函数直接在客户端调用；数据持久化改用 localStorage（`lib/storage.ts`）；AI 解读改为规则文案（`lib/ruleText.ts`）。动态路由 `/result/[id]` 等因无法预生成改为查询参数路由 `/result?id=`。

**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS + localStorage（无 Prisma、无 API Key、无后端）

---

## 文件改动总表

### 新建
- `name-static/lib/storage.ts` — localStorage CRUD（个人/公司/起名三类）
- `name-static/lib/ruleText.ts` — 规则文案生成（替代 AI）
- `name-static/app/result/page.tsx` — 个人结果页（客户端，查询参数）
- `name-static/app/company/result/page.tsx` — 公司结果页（客户端）
- `name-static/app/naming/result/page.tsx` — 起名结果页（客户端）

### 修改
- `name-static/next.config.ts` — 加 `output: 'export'`
- `name-static/package.json` — 移除 prisma、@prisma/client
- `name-static/components/name/AIInterpretation.tsx` — 改为展示规则文案
- `name-static/components/name/NameInputForm.tsx` — 直接调用 analyze()，存 localStorage
- `name-static/components/name/CompanyInputForm.tsx` — 直接调用 analyzeCompany()，存 localStorage
- `name-static/components/name/NamingInputForm.tsx` — 直接调用 suggestNaming()，存 localStorage
- `name-static/components/name/RecordPicker.tsx` — 改读 localStorage
- `name-static/components/name/DeleteButton.tsx` — 改用 onDelete 回调
- `name-static/components/name/HistoryMultiSelect.tsx` — 链接 `/result?id=`
- `name-static/components/name/HistoryTabs.tsx` — 链接更新 + 接收 onDelete 回调
- `name-static/app/page.tsx` — 移除 Prisma edit 模式
- `name-static/app/history/page.tsx` — 全改客户端渲染
- `name-static/app/compare/page.tsx` — 全改客户端渲染
- `name-static/app/company/compare/page.tsx` — 全改客户端渲染

### 删除
- `name-static/app/api/` 整个目录
- `name-static/app/result/[id]/` 目录（被 result/page.tsx 替代）
- `name-static/app/company/result/[id]/` 目录
- `name-static/app/naming/result/[id]/` 目录
- `name-static/lib/db.ts`
- `name-static/lib/claude.ts`
- `name-static/lib/prompts.ts`
- `name-static/lib/promptsCompany.ts`
- `name-static/prisma/`
- `name-static/.env.example`（如存在）
- `name-static/app/.env`（如存在）

---

## Task 1: 初始化 name-static/ 项目

**Files:**
- Create: `name-static/`（从 app/ 复制）
- Modify: `name-static/next.config.ts`
- Modify: `name-static/package.json`

- [ ] **Step 1: 复制项目并清理无关文件**

```bash
cp -r /Users/bessie/cursor/name/app /Users/bessie/cursor/name/name-static
rm -rf /Users/bessie/cursor/name/name-static/node_modules
rm -rf /Users/bessie/cursor/name/name-static/.next
rm -f /Users/bessie/cursor/name/name-static/dev.db
rm -f /Users/bessie/cursor/name/name-static/tsconfig.tsbuildinfo
```

- [ ] **Step 2: 配置 next.config.ts 开启静态导出**

将 `name-static/next.config.ts` 改为：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 3: 更新 package.json 移除 Prisma 依赖**

在 `name-static/package.json` 中，从 `dependencies` 里删除：
```
"@prisma/client": "^5.22.0",
"prisma": "^5.22.0",
```

- [ ] **Step 4: 安装依赖**

```bash
cd /Users/bessie/cursor/name/name-static && npm install
```

Expected: 安装完成，无报错。

- [ ] **Step 5: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/ && git commit -m "feat: 初始化 name-static 静态导出项目"
```

---

## Task 2: 创建 lib/storage.ts

**Files:**
- Create: `name-static/lib/storage.ts`

- [ ] **Step 1: 创建 storage.ts**

```ts
// name-static/lib/storage.ts
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/lib/storage.ts && git commit -m "feat(static): 添加 localStorage storage 模块"
```

---

## Task 3: 创建 lib/ruleText.ts

**Files:**
- Create: `name-static/lib/ruleText.ts`

- [ ] **Step 1: 创建 ruleText.ts**

```ts
// name-static/lib/ruleText.ts
import type { AnalysisResult, CompanyAnalysisResult, EnergyFortune } from "@/types";

const STROKE_FORTUNE_DESC: Record<string, string> = {
  大吉: "格局上上，能量充盈，对运势助益极大",
  吉: "格局吉祥，运势平稳上扬，整体有利",
  半吉: "格局略带吉意，整体尚可，注意把握机遇",
  半凶: "格局略有不足，需后天积极进取以弥补",
  凶: "格局偏凶，运势起伏较大，宜谨慎行事",
  大凶: "格局凶险，运势阻碍较多，建议慎重考虑改名",
};

const ENERGY_FORTUNE_WEIGHT: Record<EnergyFortune, number> = {
  大吉: 3,
  吉: 2,
  小吉: 1,
  小凶: -1,
  凶: -2,
  大凶: -3,
};

function energyScore(fortune: EnergyFortune | null): number {
  if (!fortune) return 0;
  return ENERGY_FORTUNE_WEIGHT[fortune] ?? 0;
}

function overallEnergyComment(score: number): string {
  if (score >= 10) return "干支能量极为充沛，各方面均有助力，是难得的吉名。";
  if (score >= 5) return "干支能量较为充足，多数方面顺遂，整体运势良好。";
  if (score >= 0) return "干支能量中等，吉凶参半，运势平稳，需把握时机。";
  if (score >= -5) return "干支能量略显不足，部分方面存在挑战，需坚持努力。";
  return "干支能量偏弱，多数方面存在阻力，建议结合其他方面综合考量。";
}

export function generateRuleText(result: AnalysisResult): string {
  const { strokeAnalysis, plumBlossom, energyAnalysis } = result;
  const { surname, givenName } = result.input;

  // 笔画部分
  const sr = strokeAnalysis.results;
  const strokeLines = [
    `姓「${sr.surname.char}」（${sr.surname.strokes}画）：${sr.surname.fortune}格——${STROKE_FORTUNE_DESC[sr.surname.fortune] ?? ""}。${sr.surname.meaning}`,
    `名「${sr.nameFirst.char}」（${sr.nameFirst.strokes}画）：${sr.nameFirst.fortune}格——${STROKE_FORTUNE_DESC[sr.nameFirst.fortune] ?? ""}。${sr.nameFirst.meaning}`,
  ];
  if (sr.nameLast.char !== sr.nameFirst.char) {
    strokeLines.push(
      `字「${sr.nameLast.char}」（${sr.nameLast.strokes}画）：${sr.nameLast.fortune}格——${STROKE_FORTUNE_DESC[sr.nameLast.fortune] ?? ""}。${sr.nameLast.meaning}`
    );
  }

  // 梅花易数部分（直接使用算法已有的 interpretation）
  const plumLines = plumBlossom.stages.map(
    (s) => `**${s.stage}（${s.type}·${s.hexagram.name}）**：${s.fortune}——${s.interpretation}`
  );

  // 能量点部分
  const totalScore = energyAnalysis.points.reduce(
    (acc, p) => acc + energyScore(p.nineStarFortune) + energyScore(p.diZhiFortune),
    0
  );
  const goodCount = energyAnalysis.points.filter(
    (p) => p.nineStarFortune && ["大吉", "吉", "小吉"].includes(p.nineStarFortune)
  ).length;
  const badCount = energyAnalysis.points.filter(
    (p) => p.nineStarFortune && ["凶", "大凶", "小凶"].includes(p.nineStarFortune)
  ).length;

  return [
    `## 「${surname}${givenName}」命理综合解析`,
    "",
    "### 一、笔画格局解析",
    ...strokeLines,
    "",
    "### 二、梅花易数运势",
    ...plumLines,
    "",
    "### 三、干支能量综评",
    `共 ${energyAnalysis.points.length} 个能量点，吉性 ${goodCount} 个，凶性 ${badCount} 个。`,
    overallEnergyComment(totalScore),
    "",
    "### 综合建议",
    buildSuggestion(sr.surname.fortune, sr.nameFirst.fortune, plumBlossom.stages[0]?.fortune),
  ].join("\n");
}

function buildSuggestion(
  surnameFortune: string,
  nameFirstFortune: string,
  earlyFortune: string | undefined
): string {
  const goodCount = [surnameFortune, nameFirstFortune, earlyFortune].filter(
    (f) => f && ["大吉", "吉", "半吉"].includes(f)
  ).length;

  if (goodCount === 3)
    return "整体来看，此名笔画格局优良，梅花易数早年运势吉祥，综合评定为上佳之名，可放心使用。";
  if (goodCount === 2)
    return "整体来看，此名大体吉祥，部分格局略有不足，但总体平衡，属于较好的名字。";
  if (goodCount === 1)
    return "整体来看，此名吉凶参半，建议结合家族五行与个人实际情况综合判断。";
  return "整体来看，此名格局偏弱，若条件允许，建议咨询专业命理师进一步优化。";
}

// ── 公司名规则文案 ────────────────────────────────────────

export function generateCompanyRuleText(result: CompanyAnalysisResult): string {
  const { strokeAnalysis, plumBlossom, energyAnalysis } = result;
  const { companyName } = result.input;

  const charDesc = strokeAnalysis.chars
    .map((c) => `「${c.char}」${c.strokes}画（${c.fortune}）`)
    .join("、");

  const plumLines = plumBlossom.stages.map(
    (s) => `**${s.stage}（${s.type}·${s.hexagram.name}）**：${s.fortune}——${s.interpretation}`
  );

  const goodCount = energyAnalysis.points.filter(
    (p) => p.nineStarFortune && ["大吉", "吉", "小吉"].includes(p.nineStarFortune)
  ).length;
  const totalScore = energyAnalysis.points.reduce(
    (acc, p) => acc + energyScore(p.nineStarFortune) + energyScore(p.diZhiFortune),
    0
  );

  return [
    `## 「${companyName}」公司名命理解析`,
    "",
    "### 一、字画格局",
    `公司名各字：${charDesc}`,
    `总笔画数：${strokeAnalysis.totalStrokes}`,
    "",
    "### 二、梅花易数运势",
    ...plumLines,
    "",
    "### 三、能量综评",
    `共 ${energyAnalysis.points.length} 个能量点，吉性 ${goodCount} 个。`,
    overallEnergyComment(totalScore),
  ].join("\n");
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/lib/ruleText.ts && git commit -m "feat(static): 添加规则文案生成模块"
```

---

## Task 4: 改写 AIInterpretation.tsx

**Files:**
- Modify: `name-static/components/name/AIInterpretation.tsx`

- [ ] **Step 1: 改写为规则文案展示**

将 `name-static/components/name/AIInterpretation.tsx` 全部替换为：

```tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRuleText } from "@/lib/ruleText";
import type { AnalysisResult } from "@/types";

interface Props {
  analysisResult: AnalysisResult;
}

export function AIInterpretation({ analysisResult }: Props) {
  const text = useMemo(() => generateRuleText(analysisResult), [analysisResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>四、命理综合解析</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          基于三大模块排盘结果生成命理解读
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
        />
      </CardContent>
    </Card>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/components/name/AIInterpretation.tsx && git commit -m "feat(static): AIInterpretation 改为规则文案，去掉 AI 流式调用"
```

---

## Task 5: 改写 NameInputForm.tsx

**Files:**
- Modify: `name-static/components/name/NameInputForm.tsx`

- [ ] **Step 1: 将两个 fetch 调用改为直接函数调用**

在文件顶部，修改 import 部分（添加 analyze 和 saveEvaluation，删除无用的）：

```tsx
// 在现有 import 列表末尾添加：
import { analyze } from "@/lib/analyze";
import { saveEvaluation } from "@/lib/storage";
```

- [ ] **Step 2: 替换 handleSubmit 函数**

找到 `handleSubmit` 函数，整体替换为：

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit) return;
  setLoading(true);
  try {
    const analysisResult = analyze(form);
    setResult(analysisResult);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 3: 替换 handleSave 函数**

找到 `handleSave` 函数，整体替换为：

```tsx
const handleSave = () => {
  if (!result) return;
  setSaving(true);
  try {
    const id = saveEvaluation({
      surname: form.surname,
      givenName: form.givenName,
      birthDate: form.birthDate,
      isLunar: form.isLunar,
      zodiacOverride: form.zodiacOverride,
      fatherSurname: form.fatherSurname,
      fatherZodiac: form.fatherZodiac,
      motherSurname: form.motherSurname,
      motherZodiac: form.motherZodiac,
      childZodiac: form.childZodiac,
    });
    router.push(`/result?id=${id}`);
  } finally {
    setSaving(false);
  }
};
```

注意：`handleSave` 不再是 async 函数，去掉 `async` 关键字。

- [ ] **Step 4: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/components/name/NameInputForm.tsx && git commit -m "feat(static): NameInputForm 改为直接调用 analyze()，保存至 localStorage"
```

---

## Task 6: 改写 CompanyInputForm.tsx

**Files:**
- Modify: `name-static/components/name/CompanyInputForm.tsx`

- [ ] **Step 1: 添加 import**

在文件顶部添加：

```tsx
import { analyzeCompany } from "@/lib/analyzeCompany";
import { saveCompanyEvaluation } from "@/lib/storage";
```

- [ ] **Step 2: 替换 handleSubmit**

找到 `handleSubmit`，替换为：

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit) return;
  setLoading(true);
  try {
    const payload: CompanyInput = {
      ...form,
      partnerNames: form.partnerNames.filter((n) => n.trim()),
    };
    const analysisResult = analyzeCompany(payload);
    setResult(analysisResult);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 3: 替换 handleSave**

找到 `handleSave`，替换为：

```tsx
const handleSave = () => {
  if (!result) return;
  setSaving(true);
  try {
    const id = saveCompanyEvaluation({
      companyName: result.input.companyName,
      founderName: result.input.founderName,
      partnerNames: result.input.partnerNames,
    });
    router.push(`/company/result?id=${id}`);
  } finally {
    setSaving(false);
  }
};
```

同样去掉 `async`，并删除 `setSaveError` 相关代码（不再需要网络错误处理）。如果文件中有 `const [saveError, setSaveError] = useState<string | null>(null)` 及相关 JSX，一并删除。

- [ ] **Step 4: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/components/name/CompanyInputForm.tsx && git commit -m "feat(static): CompanyInputForm 改为直接调用 analyzeCompany()，保存至 localStorage"
```

---

## Task 7: 改写 NamingInputForm.tsx

**Files:**
- Modify: `name-static/components/name/NamingInputForm.tsx`

- [ ] **Step 1: 添加 import**

在文件顶部添加：

```tsx
import { suggestNaming } from "@/lib/namingSuggestion";
import { saveNamingEvaluation } from "@/lib/storage";
import type { NamingInput } from "@/types";
```

- [ ] **Step 2: 替换 fetch('/api/naming-suggest') 调用**

找到调用 `/api/naming-suggest` 的那段代码，替换为直接调用：

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit) return;
  setLoading(true);
  try {
    const input: NamingInput = {
      surname: form.surname,
      ownZodiac: form.ownZodiac,
      fatherSurname: form.fatherSurname,
      fatherZodiac: form.fatherZodiac,
      motherSurname: form.motherSurname,
      motherZodiac: form.motherZodiac,
    };
    const namingResult = suggestNaming(input);
    setResult(namingResult);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 3: 替换 fetch('/api/naming-save') 调用**

找到保存相关函数，替换为：

```tsx
const handleSave = () => {
  if (!result) return;
  setSaving(true);
  try {
    const id = saveNamingEvaluation({
      surname: result.input.surname,
      ownZodiac: result.input.ownZodiac,
      fatherSurname: result.input.fatherSurname,
      fatherZodiac: result.input.fatherZodiac,
      motherSurname: result.input.motherSurname,
      motherZodiac: result.input.motherZodiac,
      resultJson: JSON.stringify(result),
    });
    router.push(`/naming/result?id=${id}`);
  } finally {
    setSaving(false);
  }
};
```

- [ ] **Step 4: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/components/name/NamingInputForm.tsx && git commit -m "feat(static): NamingInputForm 改为直接调用 suggestNaming()，保存至 localStorage"
```

---

## Task 8: 改写 RecordPicker.tsx 和 DeleteButton.tsx

**Files:**
- Modify: `name-static/components/name/RecordPicker.tsx`
- Modify: `name-static/components/name/DeleteButton.tsx`

- [ ] **Step 1: 改写 RecordPicker.tsx**

将 `name-static/components/name/RecordPicker.tsx` 的 `useEffect` 中 `fetch("/api/evaluation")` 替换为读 localStorage：

```tsx
import { listEvaluations } from "@/lib/storage";
// ...

useEffect(() => {
  const data = listEvaluations();
  setRecords(data);
  setLoading(false);
}, []);
```

同时在文件顶部添加该 import。

- [ ] **Step 2: 改写 DeleteButton.tsx**

将 `name-static/components/name/DeleteButton.tsx` 全部替换为：

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  onDelete: (id: string) => void;
}

export function DeleteButton({ id, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (!confirm("确认删除这条记录？")) return;
    setLoading(true);
    onDelete(id);
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "删除中" : "删除"}
    </Button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/components/name/RecordPicker.tsx name-static/components/name/DeleteButton.tsx && git commit -m "feat(static): RecordPicker 读 localStorage，DeleteButton 改用回调"
```

---

## Task 9: 改写 app/page.tsx（主页）

**Files:**
- Modify: `name-static/app/page.tsx`

- [ ] **Step 1: 移除 Prisma edit 模式**

将 `name-static/app/page.tsx` 全部替换为（去掉 Prisma 和 searchParams，改为纯客户端组件）：

```tsx
import { NameInputForm } from "@/components/name/NameInputForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">名字评测</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <Link href="/" className="px-3 py-1.5 bg-amber-700 text-white font-medium">
                人名评测
              </Link>
              <Link href="/company" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors border-l">
                公司评测
              </Link>
              <Link href="/naming" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors border-l">
                命名建议
              </Link>
            </div>
            <Link href="/history" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              历史记录
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-amber-900">姓名命理评测</h2>
          <p className="text-muted-foreground">
            基于笔画数命理、梅花易数、干支能量三大体系，深度解读您的姓名密码
          </p>
        </div>
        <NameInputForm />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/app/page.tsx && git commit -m "feat(static): 主页移除 Prisma edit 模式"
```

---

## Task 10: 创建结果页（查询参数版）

**Files:**
- Create: `name-static/app/result/page.tsx`（替代 `[id]/page.tsx`）
- Create: `name-static/app/company/result/page.tsx`
- Create: `name-static/app/naming/result/page.tsx`
- Delete: `name-static/app/result/[id]/page.tsx`（整个 [id] 目录）
- Delete: `name-static/app/company/result/[id]/page.tsx`
- Delete: `name-static/app/naming/result/[id]/page.tsx`

- [ ] **Step 1: 删除旧动态路由目录**

```bash
rm -rf /Users/bessie/cursor/name/name-static/app/result/\[id\]
rm -rf /Users/bessie/cursor/name/name-static/app/company/result/\[id\]
rm -rf /Users/bessie/cursor/name/name-static/app/naming/result/\[id\]
```

- [ ] **Step 2: 创建 app/result/page.tsx**

```tsx
// name-static/app/result/page.tsx
import { Suspense } from "react";
import ResultPageContent from "./ResultPageContent";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <ResultPageContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: 创建 app/result/ResultPageContent.tsx**

```tsx
// name-static/app/result/ResultPageContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyze } from "@/lib/analyze";
import { getEvaluation } from "@/lib/storage";
import { StrokeAnalysisCard } from "@/components/name/StrokeAnalysis";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { EnergyMatrixCard } from "@/components/name/EnergyMatrix";
import { AIInterpretation } from "@/components/name/AIInterpretation";
import { ComparePickerButton } from "@/components/name/ComparePickerButton";
import { ShareButton } from "@/components/name/ShareButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import type { StoredEvaluation } from "@/lib/storage";

export default function ResultPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [evaluation, setEvaluation] = useState<StoredEvaluation | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const ev = getEvaluation(id);
    if (!ev) { setNotFound(true); return; }
    setEvaluation(ev);
    setResult(analyze({
      surname: ev.surname,
      givenName: ev.givenName,
      birthDate: ev.birthDate,
      isLunar: ev.isLunar,
      zodiacOverride: ev.zodiacOverride,
      fatherSurname: ev.fatherSurname,
      fatherZodiac: ev.fatherZodiac,
      motherSurname: ev.motherSurname,
      motherZodiac: ev.motherZodiac,
      childZodiac: ev.childZodiac,
    }));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result || !evaluation) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                {evaluation.surname}{evaluation.givenName} 命理评测报告
              </h1>
              <p className="text-xs text-muted-foreground">
                出生：{evaluation.birthDate}{evaluation.isLunar ? "（农历）" : "（阳历）"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ShareButton name={`${evaluation.surname}${evaluation.givenName}`} />
            <ComparePickerButton currentId={id} />
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新评测
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <StrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} />
        <EnergyMatrixCard data={result.energyAnalysis} />
        <AIInterpretation analysisResult={result} />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 创建 app/company/result/page.tsx**

```tsx
// name-static/app/company/result/page.tsx
import { Suspense } from "react";
import CompanyResultContent from "./CompanyResultContent";

export default function CompanyResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompanyResultContent />
    </Suspense>
  );
}
```

- [ ] **Step 5: 创建 app/company/result/CompanyResultContent.tsx**

```tsx
// name-static/app/company/result/CompanyResultContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { getCompanyEvaluation } from "@/lib/storage";
import { CompanyStrokeAnalysisCard } from "@/components/name/CompanyStrokeAnalysisCard";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { CompanyEnergyMatrixCard } from "@/components/name/CompanyEnergyMatrixCard";
import { ShareButton } from "@/components/name/ShareButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCompanyRuleText } from "@/lib/ruleText";
import type { CompanyAnalysisResult } from "@/types";
import type { StoredCompanyEvaluation } from "@/lib/storage";

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export default function CompanyResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [evaluation, setEvaluation] = useState<StoredCompanyEvaluation | null>(null);
  const [result, setResult] = useState<CompanyAnalysisResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const ev = getCompanyEvaluation(id);
    if (!ev) { setNotFound(true); return; }
    setEvaluation(ev);
    setResult(analyzeCompany({
      companyName: ev.companyName,
      founderName: ev.founderName,
      partnerNames: ev.partnerNames,
    }));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/company" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result || !evaluation) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  const ruleText = generateCompanyRuleText(result);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                {evaluation.companyName} 公司名评测报告
              </h1>
              <p className="text-xs text-muted-foreground">创始人：{evaluation.founderName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/history?tab=company" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ShareButton name={evaluation.companyName} />
            <Link href="/company" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新评测
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <CompanyStrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} />
        <CompanyEnergyMatrixCard data={result.energyAnalysis} />
        <Card>
          <CardHeader>
            <CardTitle>四、命理综合解析</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(ruleText) }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: 创建 app/naming/result/page.tsx 和 NamingResultContent.tsx**

```tsx
// name-static/app/naming/result/page.tsx
import { Suspense } from "react";
import NamingResultContent from "./NamingResultContent";

export default function NamingResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <NamingResultContent />
    </Suspense>
  );
}
```

```tsx
// name-static/app/naming/result/NamingResultContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getNamingEvaluation } from "@/lib/storage";
import { NamingSuggestionResult } from "@/components/name/NamingSuggestionResult";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NamingResult } from "@/types";

export default function NamingResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [result, setResult] = useState<NamingResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const record = getNamingEvaluation(id);
    if (!record) { setNotFound(true); return; }
    setResult(JSON.parse(record.resultJson) as NamingResult);
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/naming" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">命名建议</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/history?tab=naming" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <Link href="/naming" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新分析
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <NamingSuggestionResult result={result} />
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/app/result/ name-static/app/company/result/ name-static/app/naming/result/ && git commit -m "feat(static): 结果页改为客户端查询参数路由，替代动态路由"
```

---

## Task 11: 改写 history/page.tsx

**Files:**
- Modify: `name-static/app/history/page.tsx`

- [ ] **Step 1: 改写为客户端渲染**

将 `name-static/app/history/page.tsx` 全部替换为：

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  listEvaluations,
  listCompanyEvaluations,
  listNamingEvaluations,
  deleteEvaluation,
  deleteCompanyEvaluation,
  deleteNamingEvaluation,
} from "@/lib/storage";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryTabs } from "@/components/name/HistoryTabs";
import type {
  StoredEvaluation,
  StoredCompanyEvaluation,
  StoredNamingEvaluation,
} from "@/lib/storage";

function HistoryContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? undefined;

  const [evaluations, setEvaluations] = useState<StoredEvaluation[]>([]);
  const [companyEvaluations, setCompanyEvaluations] = useState<StoredCompanyEvaluation[]>([]);
  const [namingEvaluations, setNamingEvaluations] = useState<StoredNamingEvaluation[]>([]);

  const reload = () => {
    setEvaluations(listEvaluations());
    setCompanyEvaluations(listCompanyEvaluations());
    setNamingEvaluations(listNamingEvaluations());
  };

  useEffect(() => { reload(); }, []);

  const handleDeletePersonal = (id: string) => { deleteEvaluation(id); reload(); };
  const handleDeleteCompany = (id: string) => { deleteCompanyEvaluation(id); reload(); };
  const handleDeleteNaming = (id: string) => { deleteNamingEvaluation(id); reload(); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">历史评测记录</h1>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-amber-700 hover:bg-amber-800 text-white")}>
            新评测
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <HistoryTabs
          personalEvaluations={evaluations.map((e) => ({
            id: e.id,
            surname: e.surname,
            givenName: e.givenName,
            birthDate: e.birthDate,
            isLunar: e.isLunar,
            createdAt: new Date(e.createdAt),
          }))}
          companyEvaluations={companyEvaluations.map((e) => ({
            id: e.id,
            companyName: e.companyName,
            founderName: e.founderName,
            createdAt: new Date(e.createdAt),
          }))}
          namingEvaluations={namingEvaluations.map((e) => ({
            id: e.id,
            surname: e.surname,
            ownZodiac: e.ownZodiac,
            fatherSurname: e.fatherSurname,
            fatherZodiac: e.fatherZodiac ?? null,
            motherSurname: e.motherSurname,
            motherZodiac: e.motherZodiac,
            createdAt: new Date(e.createdAt),
          }))}
          defaultTab={tab}
          onDeletePersonal={handleDeletePersonal}
          onDeleteCompany={handleDeleteCompany}
          onDeleteNaming={handleDeleteNaming}
        />
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 更新 HistoryTabs.tsx 接收 onDelete 回调并更新链接**

在 `name-static/components/name/HistoryTabs.tsx` 中：

1. 在 Props 接口添加三个回调：
```tsx
onDeletePersonal?: (id: string) => void;
onDeleteCompany?: (id: string) => void;
onDeleteNaming?: (id: string) => void;
```

2. 将 `/company/result/${ev.id}` 改为 `/company/result?id=${ev.id}`
3. 将 `/naming/result/${ev.id}` 改为 `/naming/result?id=${ev.id}`

4. 找到 `<DeleteButton>` 的调用，将 `deleteUrl` 改为 `onDelete` 回调：
```tsx
// 个人记录的 DeleteButton：
<DeleteButton id={ev.id} onDelete={onDeletePersonal ?? (() => {})} />
// 公司记录：
<DeleteButton id={ev.id} onDelete={onDeleteCompany ?? (() => {})} />
// 起名记录：
<DeleteButton id={ev.id} onDelete={onDeleteNaming ?? (() => {})} />
```

- [ ] **Step 3: 更新 HistoryMultiSelect.tsx 链接**

在 `name-static/components/name/HistoryMultiSelect.tsx` 中：
将 `href={/result/${ev.id}}` 改为 `href={/result?id=${ev.id}}`

- [ ] **Step 4: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/app/history/ name-static/components/name/HistoryTabs.tsx name-static/components/name/HistoryMultiSelect.tsx && git commit -m "feat(static): history 页改为客户端渲染，删除操作通过 localStorage"
```

---

## Task 12: 改写 compare 页面

**Files:**
- Modify: `name-static/app/compare/page.tsx`
- Modify: `name-static/app/company/compare/page.tsx`

- [ ] **Step 1: 改写 app/compare/page.tsx**

将 `name-static/app/compare/page.tsx` 全部替换为：

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvaluation } from "@/lib/storage";
import { analyze } from "@/lib/analyze";
import { CompareView } from "@/components/name/CompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

function CompareContent() {
  const searchParams = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";
  const c = searchParams.get("c") ?? "";
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!a || !b) { setMissing(true); return; }
    const ids = [a, b, ...(c ? [c] : [])];
    const evs = ids.map((id) => getEvaluation(id));
    if (evs.some((ev) => !ev)) { setMissing(true); return; }
    setResults(evs.map((ev) => analyze({
      surname: ev!.surname,
      givenName: ev!.givenName,
      birthDate: ev!.birthDate,
      isLunar: ev!.isLunar,
      zodiacOverride: ev!.zodiacOverride,
      fatherSurname: ev!.fatherSurname,
      fatherZodiac: ev!.fatherZodiac,
      motherSurname: ev!.motherSurname,
      motherZodiac: ev!.motherZodiac,
      childZodiac: ev!.childZodiac,
    })));
  }, [a, b, c]);

  if (missing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>找不到对比记录</p>
        <Link href="/history" className={cn(buttonVariants())}>返回历史记录</Link>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">姓名对比</h1>
          </div>
          <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            ← 返回历史
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <CompareView results={results} />
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompareContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 改写 app/company/compare/page.tsx**

将 `name-static/app/company/compare/page.tsx` 全部替换为：

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyEvaluation } from "@/lib/storage";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { CompanyCompareView } from "@/components/name/CompanyCompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyAnalysisResult } from "@/types";

function CompanyCompareContent() {
  const searchParams = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";
  const c = searchParams.get("c") ?? "";
  const [results, setResults] = useState<CompanyAnalysisResult[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!a || !b) { setMissing(true); return; }
    const ids = [a, b, ...(c ? [c] : [])];
    const evs = ids.map((id) => getCompanyEvaluation(id));
    if (evs.some((ev) => !ev)) { setMissing(true); return; }
    setResults(evs.map((ev) => analyzeCompany({
      companyName: ev!.companyName,
      founderName: ev!.founderName,
      partnerNames: ev!.partnerNames,
    })));
  }, [a, b, c]);

  if (missing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>找不到对比记录</p>
        <Link href="/history?tab=company" className={cn(buttonVariants())}>返回历史记录</Link>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">公司名对比</h1>
          </div>
          <Link href="/history?tab=company" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            ← 返回历史
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <CompanyCompareView results={results} />
      </main>
    </div>
  );
}

export default function CompanyComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompanyCompareContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/app/compare/ name-static/app/company/compare/ && git commit -m "feat(static): compare 页面改为客户端渲染，读 localStorage"
```

---

## Task 13: 清理删除后端相关文件

**Files:**
- Delete: `name-static/app/api/`
- Delete: `name-static/lib/db.ts`
- Delete: `name-static/lib/claude.ts`
- Delete: `name-static/lib/prompts.ts`
- Delete: `name-static/lib/promptsCompany.ts`
- Delete: `name-static/prisma/`
- Delete: `name-static/app/.env`（如存在）

- [ ] **Step 1: 删除文件**

```bash
rm -rf /Users/bessie/cursor/name/name-static/app/api
rm -f /Users/bessie/cursor/name/name-static/lib/db.ts
rm -f /Users/bessie/cursor/name/name-static/lib/claude.ts
rm -f /Users/bessie/cursor/name/name-static/lib/prompts.ts
rm -f /Users/bessie/cursor/name/name-static/lib/promptsCompany.ts
rm -rf /Users/bessie/cursor/name/name-static/prisma
rm -f /Users/bessie/cursor/name/name-static/app/.env
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bessie/cursor/name && git add -A && git commit -m "chore(static): 删除 API 路由、Prisma、db/claude/prompts 等后端文件"
```

---

## Task 14: 构建验证

- [ ] **Step 1: 安装依赖（如未安装）**

```bash
cd /Users/bessie/cursor/name/name-static && npm install
```

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd /Users/bessie/cursor/name/name-static && npx tsc --noEmit 2>&1
```

Expected: 无报错。若有报错按错误信息修复对应文件后重新检查。

- [ ] **Step 3: 运行构建**

```bash
cd /Users/bessie/cursor/name/name-static && npm run build 2>&1
```

Expected: 构建成功，生成 `out/` 目录，无 Error。

- [ ] **Step 4: 验证 out/ 目录**

```bash
ls /Users/bessie/cursor/name/name-static/out/
```

Expected: 包含 `index.html`、`company/`、`naming/`、`history/`、`result/`、`compare/` 等目录。

- [ ] **Step 5: 本地预览**

```bash
cd /Users/bessie/cursor/name/name-static && npx serve out -p 4000 2>&1 &
```

打开浏览器访问 `http://localhost:4000`，验证：
- 首页加载正常
- 输入姓名后点击「开始评测」能显示结果
- 点击「保存并查看完整报告」跳转到 `/result?id=xxx`
- 历史记录页能显示保存的记录
- 删除功能正常

- [ ] **Step 6: 打包 out/ 目录**

```bash
cd /Users/bessie/cursor/name && zip -r name-static-out.zip name-static/out/
du -sh name-static-out.zip
```

- [ ] **Step 7: 最终 Commit**

```bash
cd /Users/bessie/cursor/name && git add name-static/ && git commit -m "feat: name-static 静态导出版本完成，out/ 可直接部署"
```
