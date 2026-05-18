import type { Bagua, Hexagram, WuXing } from "@/types";

// 八卦余数映射（笔画数 % 8）
export const REMAINDER_TO_BAGUA: Record<number, Bagua> = {
  1: "乾", 2: "兑", 3: "离", 4: "震",
  5: "巽", 6: "坎", 7: "艮", 0: "坤",
};

// 八卦对应五行
export const BAGUA_WUXING: Record<Bagua, WuXing> = {
  乾: "金", 兑: "金", 离: "火",
  震: "木", 巽: "木", 坎: "水",
  艮: "土", 坤: "土",
};

// 八卦爻符（从上到下 3 爻）
// 乾=111, 兑=011, 离=101, 震=001, 巽=110, 坎=010, 艮=100, 坤=000
const BAGUA_LINES: Record<Bagua, [number, number, number]> = {
  乾: [1, 1, 1], 兑: [0, 1, 1], 离: [1, 0, 1],
  震: [0, 0, 1], 巽: [1, 1, 0], 坎: [0, 1, 0],
  艮: [1, 0, 0], 坤: [0, 0, 0],
};

// 六十四卦：上卦×下卦 → 卦名
// 格式：[上卦][下卦] = 卦名
const HEXAGRAM_NAMES: Record<string, string> = {
  乾乾: "乾为天", 乾兑: "天泽履", 乾离: "天火同人", 乾震: "天雷无妄",
  乾巽: "天风姤", 乾坎: "天水讼", 乾艮: "天山遁", 乾坤: "天地否",
  兑乾: "泽天夬", 兑兑: "兑为泽", 兑离: "泽火革", 兑震: "泽雷随",
  兑巽: "泽风大过", 兑坎: "泽水困", 兑艮: "泽山咸", 兑坤: "泽地萃",
  离乾: "火天大有", 离兑: "火泽睽", 离离: "离为火", 离震: "火雷噬嗑",
  离巽: "火风鼎", 离坎: "火水未济", 离艮: "火山旅", 离坤: "火地晋",
  震乾: "雷天大壮", 震兑: "雷泽归妹", 震离: "雷火丰", 震震: "震为雷",
  震巽: "雷风恒", 震坎: "雷水解", 震艮: "雷山小过", 震坤: "雷地豫",
  巽乾: "风天小畜", 巽兑: "风泽中孚", 巽离: "风火家人", 巽震: "风雷益",
  巽巽: "巽为风", 巽坎: "风水涣", 巽艮: "风山渐", 巽坤: "风地观",
  坎乾: "水天需", 坎兑: "水泽节", 坎离: "水火既济", 坎震: "水雷屯",
  坎巽: "水风井", 坎坎: "坎为水", 坎艮: "水山蹇", 坎坤: "水地比",
  艮乾: "山天大畜", 艮兑: "山泽损", 艮离: "山火贲", 艮震: "山雷颐",
  艮巽: "山风蛊", 艮坎: "山水蒙", 艮艮: "艮为山", 艮坤: "山地剥",
  坤乾: "地天泰", 坤兑: "地泽临", 坤离: "地火明夷", 坤震: "地雷复",
  坤巽: "地风升", 坤坎: "地水师", 坤艮: "地山谦", 坤坤: "坤为地",
};

// 取卦：笔画数 % 8（0视为8→坤）
export function strokesToBagua(strokes: number): Bagua {
  const remainder = strokes % 8;
  return REMAINDER_TO_BAGUA[remainder];
}

// 构建六爻卦的符号（上卦在上，下卦在下，共6爻）
export function buildHexagramSymbol(upper: Bagua, lower: Bagua): string {
  const upperLines = BAGUA_LINES[upper];
  const lowerLines = BAGUA_LINES[lower];
  const all = [...upperLines, ...lowerLines];
  return all.map((l) => (l === 1 ? "—" : "- -")).join("\n");
}

// 获取卦名
export function getHexagramName(upper: Bagua, lower: Bagua): string {
  return HEXAGRAM_NAMES[`${upper}${lower}`] || `${upper}${lower}`;
}

// 构建完整卦对象
export function buildHexagram(upper: Bagua, lower: Bagua): Hexagram {
  return {
    name: getHexagramName(upper, lower),
    upper,
    lower,
    symbol: buildHexagramSymbol(upper, lower),
  };
}

// BAGUA_LINES 存储顺序是从上到下 [上爻, 二爻, 初爻]
// 以下两个函数先将两个三爻卦展开为六爻数组（从初爻到上爻，index 0 = 初爻/爻1）
function buildAllLines(upper: Bagua, lower: Bagua): number[] {
  const lo = BAGUA_LINES[lower]; // top-to-bottom: [上爻, 二爻, 初爻]
  const up = BAGUA_LINES[upper];
  // 重新排为 bottom-to-top：index 0=爻1, 1=爻2, 2=爻3, 3=爻4, 4=爻5, 5=爻6
  return [lo[2], lo[1], lo[0], up[2], up[1], up[0]];
}

// 将 bottom-to-top 的三爻数组转为 BAGUA_LINES 所用的 top-to-bottom 格式后查卦
function toBagua(a: number, b: number, c: number): Bagua {
  return findBaguaByLines([c, b, a]);
}

// 求互卦：互卦下卦 = 爻2,3,4；互卦上卦 = 爻3,4,5
export function getMutualHexagram(upper: Bagua, lower: Bagua): Hexagram {
  const all = buildAllLines(upper, lower); // [爻1, 爻2, 爻3, 爻4, 爻5, 爻6]
  const mutualLower = toBagua(all[1], all[2], all[3]); // 爻2,3,4
  const mutualUpper = toBagua(all[2], all[3], all[4]); // 爻3,4,5
  return buildHexagram(mutualUpper, mutualLower);
}

// 求变卦（动爻取反，动爻从1起算）
export function getChangedHexagram(upper: Bagua, lower: Bagua, movingYao: number): Hexagram {
  const all = buildAllLines(upper, lower);
  all[movingYao - 1] ^= 1;
  const changedLower = toBagua(all[0], all[1], all[2]); // 爻1,2,3
  const changedUpper = toBagua(all[3], all[4], all[5]); // 爻4,5,6
  return buildHexagram(changedUpper, changedLower);
}

function findBaguaByLines(lines: [number, number, number]): Bagua {
  for (const [bagua, bLines] of Object.entries(BAGUA_LINES)) {
    if (bLines[0] === lines[0] && bLines[1] === lines[1] && bLines[2] === lines[2]) {
      return bagua as Bagua;
    }
  }
  return "乾";
}

// 五行生克关系判断
type Relation = "用生体" | "体用比肩" | "体克用" | "用克体" | "体生用";

const GENERATES: Record<WuXing, WuXing> = {
  金: "水", 水: "木", 木: "火", 火: "土", 土: "金",
};
const OVERCOMES: Record<WuXing, WuXing> = {
  金: "木", 木: "土", 土: "水", 水: "火", 火: "金",
};

export function getRelation(body: WuXing, use: WuXing): Relation {
  if (body === use) return "体用比肩";
  if (GENERATES[use] === body) return "用生体";
  if (OVERCOMES[body] === use) return "体克用";
  if (OVERCOMES[use] === body) return "用克体";
  if (GENERATES[body] === use) return "体生用";
  return "体用比肩";
}

// 体用关系 → 吉凶
type Fortune = "大吉" | "吉" | "小吉" | "凶" | "大凶";
export const RELATION_FORTUNE: Record<Relation, { fortune: Fortune; interpretation: string }> = {
  体用比肩: { fortune: "大吉", interpretation: "外界环境与命主亲密无间，相得益彰，其乐融融" },
  用生体: { fortune: "吉", interpretation: "外界环境主动帮助命主，左右逢源" },
  体克用: { fortune: "小吉", interpretation: "命主能克服外界环境的困难，迎难而上" },
  体生用: { fortune: "凶", interpretation: "外界环境消耗命主，能量耗散" },
  用克体: { fortune: "大凶", interpretation: "外界环境阻碍命主发展，困难重重" },
};
