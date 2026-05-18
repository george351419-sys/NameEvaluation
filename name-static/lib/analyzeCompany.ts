import type {
  CompanyAnalysisResult,
  CompanyInput,
  PlumBlossomAnalysis,
  PlumBlossomStage,
  Bagua,
  ZodiacAnimal,
} from "@/types";
import { getStrokeCount, getStrokeFortune, getTotalStrokes } from "./strokes";
import { analyzeCompanyEnergyPoints } from "./energyPointsCompany";
import { ZODIAC_ANIMALS } from "./zodiac";
import {
  strokesToBagua,
  buildHexagram,
  getMutualHexagram,
  getChangedHexagram,
  BAGUA_WUXING,
  getRelation,
  RELATION_FORTUNE,
} from "./hexagrams";

function totalToVirtualZodiac(totalStrokes: number): ZodiacAnimal {
  const idx = ((totalStrokes - 1) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

// 动爻 = 公司总格 % 6（0 视为 6）
function totalToMovingYao(totalStrokes: number): number {
  const r = totalStrokes % 6;
  return r === 0 ? 6 : r;
}

function companyPlumBlossom(
  charStrokes: number[],
  totalStrokes: number
): PlumBlossomAnalysis {
  const n = charStrokes.length;
  let upperTotal = 0;
  let lowerTotal = 0;

  if (n === 1) {
    upperTotal = lowerTotal = charStrokes[0];
  } else if (n > 1) {
    const frontLen = Math.floor(n / 2);
    upperTotal = charStrokes.slice(0, frontLen).reduce((s, v) => s + v, 0);
    lowerTotal = charStrokes.slice(frontLen).reduce((s, v) => s + v, 0);
  }

  // 用总格推算虚拟生肖（仅用于梅花易数显示，实际动爻直接由总格除以6取余）
  const zodiac = totalToVirtualZodiac(totalStrokes);
  const upperGua = strokesToBagua(upperTotal);
  const lowerGua = strokesToBagua(lowerTotal);
  const movingYao = totalToMovingYao(totalStrokes);

  const benGua = buildHexagram(upperGua, lowerGua);
  const mutualGua = getMutualHexagram(upperGua, lowerGua);
  const changedGua = getChangedHexagram(upperGua, lowerGua, movingYao);
  const isMovingInUpper = movingYao >= 4;

  function makeStage(
    stageLabel: "早期" | "中期" | "后期",
    type: "本卦" | "互卦" | "变卦",
    hexagram: typeof benGua,
  ): PlumBlossomStage {
    const bodyGua: Bagua = isMovingInUpper ? hexagram.lower : hexagram.upper;
    const useGua: Bagua = isMovingInUpper ? hexagram.upper : hexagram.lower;
    const bodyWuxing = BAGUA_WUXING[bodyGua];
    const useWuxing = BAGUA_WUXING[useGua];
    const relation = getRelation(bodyWuxing, useWuxing);
    const { fortune, interpretation } = RELATION_FORTUNE[relation];
    return { stage: stageLabel, type, hexagram, body: bodyGua, use: useGua, bodyWuxing, useWuxing, relation, fortune, interpretation };
  }

  return {
    zodiac,
    movingYao,
    upperGua,
    lowerGua,
    stages: [
      makeStage("早期", "本卦", benGua),
      makeStage("中期", "互卦", mutualGua),
      makeStage("后期", "变卦", changedGua),
    ],
  };
}

export function analyzeCompany(input: CompanyInput): CompanyAnalysisResult {
  const companyChars = input.companyName.split("").map((char) => {
    const strokes = getStrokeCount(char);
    const fortune = getStrokeFortune(strokes);
    return { char, strokes, fortune: fortune.fortune, meaning: fortune.meaning };
  });

  const totalStrokes = companyChars.reduce((s, c) => s + c.strokes, 0);

  const strokeAnalysis = {
    chars: companyChars.map((c) => ({ char: c.char, strokes: c.strokes, fortune: c.fortune, meaning: c.meaning })),
    totalStrokes,
  };

  const plumBlossom = companyPlumBlossom(companyChars.map((c) => c.strokes), totalStrokes);

  const founderStrokes = getTotalStrokes(input.founderName);
  const partners = input.partnerNames
    .filter((n) => n.trim())
    .map((name) => ({ name: name.trim(), strokes: getTotalStrokes(name.trim()) }));

  const energyAnalysis = analyzeCompanyEnergyPoints(
    companyChars.map((c) => ({ char: c.char, strokes: c.strokes })),
    input.founderName,
    founderStrokes,
    partners
  );

  return { input, strokeAnalysis, plumBlossom, energyAnalysis };
}
