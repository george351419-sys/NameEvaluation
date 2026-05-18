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
