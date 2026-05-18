import type {
  NamingInput, NamingCandidateRow, NamingCandidatePoint,
  NamingPlumCandidate, NamingResult, EnergyFortune, WuXing, ZodiacAnimal,
} from "@/types";
import { getTotalStrokes } from "./strokes";
import { analyzePlumBlossom } from "./plumBlossom";
import { analyzeEnergyPoints } from "./energyPoints";
import { ZODIAC_NUMBER, zodiacToYao } from "./zodiac";

// ── 共用查表 ──────────────────────────────────────────────

const TIAN_GAN_MAP: Record<number, string> = {
  1: "甲", 2: "乙", 3: "丙", 4: "丁", 5: "戊",
  6: "己", 7: "庚", 8: "辛", 9: "壬", 0: "癸",
};
const DI_ZHI_MAP: Record<number, string> = {
  1: "子", 2: "丑", 3: "寅", 4: "卯",  5: "辰",  6: "巳",
  7: "午", 8: "未", 9: "申", 10: "酉", 11: "戌", 0: "亥",
};
const DI_ZHI_WUXING: Record<string, WuXing> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木",
  辰: "土", 巳: "火", 午: "火", 未: "土",
  申: "金", 酉: "金", 戌: "土", 亥: "水",
};
const GENERATES: Record<WuXing, WuXing> = {
  金: "水", 水: "木", 木: "火", 火: "土", 土: "金",
};
const OVERCOMES: Record<WuXing, WuXing> = {
  金: "木", 木: "土", 土: "水", 水: "火", 火: "金",
};

function toDiZhi(v: number): string { return DI_ZHI_MAP[v % 12]; }
export function toTianGan(v: number): string { return TIAN_GAN_MAP[v % 10]; }

function compareWuXing(pointWx: WuXing, refWx: WuXing): EnergyFortune {
  if (pointWx === refWx) return "大吉";
  if (GENERATES[pointWx] === refWx) return "吉";
  if (OVERCOMES[refWx] === pointWx) return "小吉";
  if (GENERATES[refWx] === pointWx) return "小凶";
  if (OVERCOMES[pointWx] === refWx) return "大凶";
  return "吉";
}

// ── 9个候选能量点定义 ─────────────────────────────────────

interface NamingVars {
  surname: number;
  x: number;
  zodiac: number;
  fatherSurname: number;
  motherSurname: number;
  motherZodiac: number;
}

const NAMING_POINT_DEFS: { key: string; label: string; calc: (v: NamingVars) => number }[] = [
  { key: "天格", label: "天格", calc: (v) => v.surname },
  { key: "人格", label: "人格", calc: (v) => v.x },
  { key: "财格", label: "财格", calc: (v) => v.surname + v.x },
  { key: "灵格", label: "灵格", calc: (v) => v.zodiac },
  { key: "总格", label: "总格", calc: (v) => v.surname + v.x + v.zodiac },
  { key: "配偶", label: "配偶", calc: (v) => v.motherSurname + v.motherZodiac },
  { key: "财帛宫", label: "财帛宫", calc: (v) => v.fatherSurname + v.motherSurname + v.x },
  { key: "事业宫", label: "事业宫", calc: (v) => v.fatherSurname + v.motherSurname + v.x + v.zodiac },
  { key: "机缘宫", label: "机缘宫", calc: (v) => v.zodiac + v.x },
];

// ── 候选行计算 ────────────────────────────────────────────

function calcCandidateRow(x: number, vars: NamingVars): NamingCandidateRow {
  const vWithX = { ...vars, x };
  const renGeValue = x;
  const renGeDiZhi = toDiZhi(renGeValue);
  const renGeDiZhiWuXing = DI_ZHI_WUXING[renGeDiZhi];

  const fortuneCount: Partial<Record<EnergyFortune, number>> = {};

  const points: NamingCandidatePoint[] = NAMING_POINT_DEFS.map((def) => {
    const value = def.calc(vWithX);
    const diZhi = toDiZhi(value);
    const diZhiWuXing = DI_ZHI_WUXING[diZhi];
    const diZhiFortune: EnergyFortune = def.key === "人格"
      ? "大吉"
      : compareWuXing(diZhiWuXing, renGeDiZhiWuXing);

    fortuneCount[diZhiFortune] = (fortuneCount[diZhiFortune] ?? 0) + 1;

    return { key: def.key, label: def.label, value, diZhiFortune };
  });

  return { x, points, fortuneCount };
}

// ── 排序比较函数 ──────────────────────────────────────────

// 凶数越少越好，大凶越少越好，大吉越多越好...
function sortScore(fc: Partial<Record<string, number>>): number[] {
  const get = (k: string) => fc[k] ?? 0;
  return [
    get("小凶") + get("凶") + get("大凶"),  // asc: fewer is better
    get("大凶"),                             // asc
    -(get("大吉")),                          // asc: negate so more is better
    -(get("吉")),
    -(get("小吉")),
  ];
}

function compareSortScore(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function isSameScore(a: number[], b: number[]): boolean {
  return a.every((v, i) => v === b[i]);
}

function selectTopN(
  items: { x: number; fortuneCount: Partial<Record<string, number>> }[],
  n: number
): number[] {
  const scored = items.map((item) => ({ x: item.x, score: sortScore(item.fortuneCount) }));
  scored.sort((a, b) => compareSortScore(a.score, b.score));

  const result: number[] = [];
  for (let i = 0; i < scored.length; i++) {
    if (result.length < n || isSameScore(scored[i].score, scored[n - 1].score)) {
      result.push(scored[i].x);
    } else {
      break;
    }
  }
  return result;
}

// ── 梅花易数候选 ──────────────────────────────────────────

function calcPlumCandidate(
  x: number,
  surnameStrokes: number,
  zodiac: ZodiacAnimal
): NamingPlumCandidate {
  // upperTotal = x, lowerTotal = surnameStrokes + x
  const plumBlossom = analyzePlumBlossom(surnameStrokes, x, 0, zodiac);

  const fortuneCount: Partial<Record<string, number>> = {};
  for (const s of plumBlossom.stages) {
    fortuneCount[s.fortune] = (fortuneCount[s.fortune] ?? 0) + 1;
  }

  return { x, plumBlossom, fortuneCount };
}

// ── 主函数 ────────────────────────────────────────────────

export function suggestNaming(input: NamingInput): NamingResult {
  const surnameStrokes = getTotalStrokes(input.surname);
  const zodiac = input.ownZodiac as ZodiacAnimal;
  const zodiacNum = ZODIAC_NUMBER[zodiac];
  const fatherSurnameStrokes = getTotalStrokes(input.fatherSurname);
  const motherSurnameStrokes = getTotalStrokes(input.motherSurname);
  const motherZodiacNum = ZODIAC_NUMBER[input.motherZodiac as ZodiacAnimal];

  const vars: NamingVars = {
    surname: surnameStrokes,
    x: 0, // overridden in loop
    zodiac: zodiacNum,
    fatherSurname: fatherSurnameStrokes,
    motherSurname: motherSurnameStrokes,
    motherZodiac: motherZodiacNum,
  };

  // Step 1: X = 1..12
  const candidateRows: NamingCandidateRow[] = [];
  for (let x = 1; x <= 12; x++) {
    candidateRows.push(calcCandidateRow(x, vars));
  }

  // Step 2: top 3 X values (by 地支五行吉凶)
  const top3X = selectTopN(candidateRows, 3);

  // Step 3: 6 plum blossom candidates (top3 + top3+12)
  const plumXValues: number[] = [];
  for (const x of top3X) {
    plumXValues.push(x, x + 12);
  }
  const plumCandidates: NamingPlumCandidate[] = plumXValues.map((x) =>
    calcPlumCandidate(x, surnameStrokes, zodiac)
  );

  // Step 4: recommend best 2 from 6 plum candidates
  const recommended = selectTopN(plumCandidates, 2);

  // Step 5: full energy analysis for recommended values
  const motherZodiacAnimal = input.motherZodiac as ZodiacAnimal;
  const fatherZodiacAnimal = (input.fatherZodiac || null) as ZodiacAnimal | null;
  const finalAnalysis = recommended.map((x) => {
    const energyAnalysis = analyzeEnergyPoints(
      surnameStrokes,
      x,          // nameFirstStrokes = x (total)
      null,       // no individual split needed
      zodiac,
      {
        fatherSurnameStrokes,
        fatherZodiac: fatherZodiacAnimal,
        motherSurnameStrokes,
        motherZodiac: motherZodiacAnimal,
        childZodiac: null,
      }
    );
    const plumBlossom = analyzePlumBlossom(surnameStrokes, x, 0, zodiac);
    return { x, energyAnalysis, plumBlossom };
  });

  return {
    input,
    surnameStrokes,
    candidateRows,
    top3X,
    plumCandidates,
    recommended,
    finalAnalysis,
  };
}
