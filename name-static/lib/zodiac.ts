import { Lunar } from "lunar-typescript";
import type { ZodiacAnimal } from "@/types";

export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  "鼠", "牛", "虎", "兔", "龙", "蛇",
  "马", "羊", "猴", "鸡", "狗", "猪",
];

// 十二生肖与序号（1-12）
export const ZODIAC_NUMBER: Record<ZodiacAnimal, number> = {
  鼠: 1, 牛: 2, 虎: 3, 兔: 4, 龙: 5, 蛇: 6,
  马: 7, 羊: 8, 猴: 9, 鸡: 10, 狗: 11, 猪: 12,
};

// 生肖数 → 动爻数（蛇/猪特殊：6→0视为6）
export function zodiacToYao(zodiac: ZodiacAnimal): number {
  const num = ZODIAC_NUMBER[zodiac];
  const yao = num % 6;
  return yao === 0 ? 6 : yao;
}

// 根据阳历日期（Date）判断生肖，以立春为界
export function getZodiacFromSolarDate(date: Date): ZodiacAnimal {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 获取当年立春日期（lunar-typescript）
  const lichun = getLiChun(year);
  const birthDay = new Date(year, month - 1, day);

  // 立春之前算上一年的生肖
  const zodiacYear = birthDay < lichun ? year - 1 : year;

  // 干支纪年从4年开始，鼠年=4, 牛=5...
  // 简化：鼠=0 mod 12（子年）
  // 鼠年：1900, 1912, 1924... 即 (year - 1900) % 12 === 0 为鼠
  const idx = ((zodiacYear - 1900) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

// 获取某年立春日期
function getLiChun(year: number): Date {
  try {
    // lunar-typescript: 节气
    const lunar = Lunar.fromYmd(year, 1, 1);
    const jieQi = lunar.getJieQiTable();
    const lichunDate = jieQi["立春"];
    if (lichunDate) {
      // lichunDate is Solar type with getYear/getMonth/getDay methods
      return new Date(lichunDate.getYear(), lichunDate.getMonth() - 1, lichunDate.getDay());
    }
  } catch {
    // fallback
  }
  // 立春大约在每年2月3-5日，默认2月4日
  return new Date(year, 1, 4);
}

// 农历日期转阳历
export function lunarToSolar(year: number, month: number, day: number): Date {
  try {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch {
    return new Date(year, month - 1, day);
  }
}
