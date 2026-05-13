import type { PlumBlossomAnalysis, PlumBlossomStage, Bagua, ZodiacAnimal } from "@/types";
import {
  strokesToBagua,
  buildHexagram,
  getMutualHexagram,
  getChangedHexagram,
  BAGUA_WUXING,
  getRelation,
  RELATION_FORTUNE,
} from "./hexagrams";
import { zodiacToYao } from "./zodiac";

export function analyzePlumBlossom(
  surnameStrokes: number,
  nameFirstStrokes: number,
  nameLastStrokes: number,
  zodiac: ZodiacAnimal
): PlumBlossomAnalysis {
  // 上卦：(名+字) % 8；下卦：(姓+名+字) % 8
  const upperTotal = nameFirstStrokes + nameLastStrokes;
  const lowerTotal = surnameStrokes + nameFirstStrokes + nameLastStrokes;

  const upperGua = strokesToBagua(upperTotal);
  const lowerGua = strokesToBagua(lowerTotal);
  const movingYao = zodiacToYao(zodiac);

  // 三卦
  const benGua = buildHexagram(upperGua, lowerGua);
  const mutualGua = getMutualHexagram(upperGua, lowerGua);
  const changedGua = getChangedHexagram(upperGua, lowerGua, movingYao);

  // 体用判断：动爻在上卦(4-6)则用=上卦，体=下卦；动爻在下卦(1-3)则用=下卦，体=上卦
  const isMovingInUpper = movingYao >= 4;

  function buildStage(
    stageLabel: "早年" | "中年" | "晚年",
    type: "本卦" | "互卦" | "变卦",
    hexagram: typeof benGua,
    movingInUpper: boolean
  ): PlumBlossomStage {
    const bodyGua: Bagua = movingInUpper ? hexagram.lower : hexagram.upper;
    const useGua: Bagua = movingInUpper ? hexagram.upper : hexagram.lower;
    const bodyWuxing = BAGUA_WUXING[bodyGua];
    const useWuxing = BAGUA_WUXING[useGua];
    const relation = getRelation(bodyWuxing, useWuxing);
    const { fortune, interpretation } = RELATION_FORTUNE[relation];
    return {
      stage: stageLabel,
      type,
      hexagram,
      body: bodyGua,
      use: useGua,
      bodyWuxing,
      useWuxing,
      relation,
      fortune,
      interpretation,
    };
  }

  const stages: PlumBlossomStage[] = [
    buildStage("早年", "本卦", benGua, isMovingInUpper),
    buildStage("中年", "互卦", mutualGua, isMovingInUpper),
    buildStage("晚年", "变卦", changedGua, isMovingInUpper),
  ];

  return { zodiac, movingYao, upperGua, lowerGua, stages };
}
