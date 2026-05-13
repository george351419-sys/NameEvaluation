import type { AnalysisResult, NameInput, ZodiacAnimal } from "@/types";
import { analyzeStrokes, getTotalStrokes, splitGivenName } from "./strokes";
import { analyzePlumBlossom } from "./plumBlossom";
import { analyzeEnergyPoints } from "./energyPoints";
import { getZodiacFromSolarDate } from "./zodiac";

export function analyze(input: NameInput): AnalysisResult {
  const { surname, givenName, birthDate } = input;

  // 拆字：名/字
  const { nameFirst, nameLast } = splitGivenName(givenName);
  const nameParts = { surname, nameFirst, nameLast: nameLast || nameFirst };

  // 笔画分析
  const strokeAnalysis = analyzeStrokes(surname, givenName);

  // 生肖：优先使用用户直接选择的生肖，否则根据生日推算（以立春为界）
  const zodiac: ZodiacAnimal = input.zodiacOverride
    ? (input.zodiacOverride as ZodiacAnimal)
    : getZodiacFromSolarDate(new Date(birthDate + "T00:00:00"));

  // 各部分笔画数（nameLastStrokes 为 null 表示无"字"，如单字名）
  const surnameStrokes = getTotalStrokes(surname);
  const nameFirstStrokes = getTotalStrokes(nameParts.nameFirst);
  const nameLastStrokes: number | null = nameLast ? getTotalStrokes(nameLast) : null;

  // 梅花易数（字缺时用 0 参与计算）
  const plumBlossom = analyzePlumBlossom(
    surnameStrokes,
    nameFirstStrokes,
    nameLastStrokes ?? 0,
    zodiac
  );

  // 父亲姓处理：未填时默认使用用户姓
  const fatherSurnameRaw = input.fatherSurname?.trim() || surname;
  const fatherSurnameStrokes = getTotalStrokes(fatherSurnameRaw);

  // 母亲姓（可选）
  const motherSurnameStrokes = input.motherSurname?.trim()
    ? getTotalStrokes(input.motherSurname.trim())
    : null;

  // 能量点分析（nameLastStrokes 传 null 时，地格等依赖"字"的点会显示为空）
  const energyAnalysis = analyzeEnergyPoints(
    surnameStrokes,
    nameFirstStrokes,
    nameLastStrokes,  // null for single-char names
    zodiac,
    {
      fatherSurnameStrokes,
      fatherZodiac: (input.fatherZodiac as ZodiacAnimal) || null,
      motherSurnameStrokes,
      motherZodiac: (input.motherZodiac as ZodiacAnimal) || null,
      childZodiac: (input.childZodiac as ZodiacAnimal) || null,
    }
  );

  return { input, nameParts, strokeAnalysis, plumBlossom, energyAnalysis };
}
