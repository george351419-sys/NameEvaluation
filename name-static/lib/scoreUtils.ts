import type { AnalysisResult } from "@/types";

type FortuneKey = "大吉" | "吉" | "小吉" | "半吉" | "半凶" | "凶" | "大凶";

const FORTUNE_WEIGHT: Record<FortuneKey, number> = {
  大吉: 100,
  吉: 80,
  小吉: 65,
  半吉: 50,
  半凶: 35,
  凶: 20,
  大凶: 0,
};

const FORTUNE_LABELS: Record<number, string> = {
  90: "上上吉",
  75: "整体吉祥",
  55: "吉凶参半",
  35: "略有不足",
  0:  "格局偏弱",
};

function fortuneScore(f: string): number {
  return FORTUNE_WEIGHT[f as FortuneKey] ?? 50;
}

export function calcScore(result: AnalysisResult): { score: number; label: string } {
  const { surname, nameFirst, nameLast } = result.strokeAnalysis.results;
  const scores = [surname, nameFirst, nameLast].map((r) => fortuneScore(r.fortune));
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  let label = "格局偏弱";
  for (const [threshold, lbl] of Object.entries(FORTUNE_LABELS).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  )) {
    if (avg >= Number(threshold)) { label = lbl; break; }
  }

  return { score: avg, label };
}

export function fortuneBadgeClass(fortune: string): string {
  return `fortune-badge fortune-${fortune}`;
}
