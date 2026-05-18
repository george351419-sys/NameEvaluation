import type {
  EnergyAnalysis,
  EnergyPoint,
  EnergyFortune,
  WuXing,
  NineStarName,
  ZodiacAnimal,
} from "@/types";

// ── 天干表 ────────────────────────────────────────────────
// 数值 % 10 → 天干（0→癸）
const TIAN_GAN_MAP: Record<number, string> = {
  1: "甲", 2: "乙", 3: "丙", 4: "丁", 5: "戊",
  6: "己", 7: "庚", 8: "辛", 9: "壬", 0: "癸",
};

// 数值 % 12 → 地支（0→亥）
const DI_ZHI_MAP: Record<number, string> = {
  1: "子", 2: "丑", 3: "寅", 4: "卯",  5: "辰",  6: "巳",
  7: "午", 8: "未", 9: "申", 10: "酉", 11: "戌", 0: "亥",
};

// 地支五行
const DI_ZHI_WUXING: Record<string, WuXing> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木",
  辰: "土", 巳: "火", 午: "火", 未: "土",
  申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// 生肖数
const ZODIAC_NUMBER: Record<ZodiacAnimal, number> = {
  鼠: 1, 牛: 2, 虎: 3, 兔: 4, 龙: 5, 蛇: 6,
  马: 7, 羊: 8, 猴: 9, 鸡: 10, 狗: 11, 猪: 12,
};

// ── 五行生克 ──────────────────────────────────────────────
const GENERATES: Record<WuXing, WuXing> = {
  金: "水", 水: "木", 木: "火", 火: "土", 土: "金",
};
const OVERCOMES: Record<WuXing, WuXing> = {
  金: "木", 木: "土", 土: "水", 水: "火", 火: "金",
};

// 各关键点 vs 人格 → 吉凶（步骤四/步骤七通用）
// 对称五级量表：大吉/吉/小吉/小凶/大凶（文档示例验证）
function compareWuXing(pointWx: WuXing, renGeWx: WuXing): EnergyFortune {
  if (pointWx === renGeWx) return "大吉";           // 比肩
  if (GENERATES[pointWx] === renGeWx) return "吉";  // 关键点生人格
  if (OVERCOMES[renGeWx] === pointWx) return "小吉"; // 人格克关键点
  if (GENERATES[renGeWx] === pointWx) return "小凶"; // 人格生关键点（耗散）
  if (OVERCOMES[pointWx] === renGeWx) return "大凶"; // 关键点克人格
  return "吉";
}

// ── 刑冲合害关系表（步骤五）────────────────────────────────
// 格式：key = 地支A + 地支B（关键点地支 + 人格地支）
const DI_ZHI_RELATION: Record<string, string> = {
  子子: "无", 子丑: "六合（化土）", 丑子: "六合（化土）",
  子寅: "无", 寅子: "无", 子卯: "无礼之刑", 卯子: "无礼之刑",
  子辰: "半三合水", 辰子: "半三合水",
  子巳: "无", 巳子: "无",
  子午: "相冲", 午子: "相冲",
  子未: "相害", 未子: "相害",
  子申: "无", 申子: "无", 子酉: "无", 酉子: "无",
  子戌: "无", 戌子: "无",
  子亥: "半三会水", 亥子: "半三会水",
  丑丑: "无",
  丑寅: "同宫", 寅丑: "同宫",
  丑卯: "无", 卯丑: "无", 丑辰: "无", 辰丑: "无",
  丑巳: "半三合金", 巳丑: "半三合金",
  丑午: "相害", 午丑: "相害",
  丑未: "相冲", 未丑: "相冲",
  丑申: "无", 申丑: "无", 丑酉: "无", 酉丑: "无",
  丑戌: "半三刑", 戌丑: "半三刑",
  丑亥: "拱会水", 亥丑: "拱会水",
  寅寅: "无",
  寅卯: "半三会木", 卯寅: "半三会木",
  寅辰: "无", 辰寅: "无",
  寅巳: "相害", 巳寅: "相害",
  寅午: "半三合火", 午寅: "半三合火",
  寅未: "无", 未寅: "无",
  寅申: "相冲", 申寅: "相冲",
  寅酉: "无", 酉寅: "无",
  寅戌: "半三合火", 戌寅: "半三合火",
  寅亥: "六合（化木）", 亥寅: "六合（化木）",
  卯卯: "自刑",
  卯辰: "相害", 辰卯: "相害",
  卯巳: "无", 巳卯: "无", 卯午: "无", 午卯: "无",
  卯未: "无", 未卯: "无", 卯申: "无", 申卯: "无",
  卯酉: "相冲", 酉卯: "相冲",
  卯戌: "六合（化火）", 戌卯: "六合（化火）",
  卯亥: "半三合木", 亥卯: "半三合木",
  辰辰: "自刑",
  辰巳: "同宫", 巳辰: "同宫",
  辰午: "无", 午辰: "无", 辰未: "无", 未辰: "无",
  辰申: "半三合水", 申辰: "半三合水",
  辰酉: "六合（化金）", 酉辰: "六合（化金）",
  辰戌: "相冲", 戌辰: "相冲",
  辰亥: "无", 亥辰: "无",
  巳巳: "无",
  巳午: "半三会火", 午巳: "半三会火",
  巳未: "无", 未巳: "无",
  巳申: "六合（化水）", 申巳: "六合（化水）",
  巳酉: "半三合金", 酉巳: "半三合金",
  巳戌: "无", 戌巳: "无",
  巳亥: "相冲", 亥巳: "相冲",
  午午: "自刑",
  午未: "六合（化火土）", 未午: "六合（化火土）",
  午申: "无", 申午: "无", 午酉: "无", 酉午: "无",
  午戌: "半三合火", 戌午: "半三合火",
  午亥: "无", 亥午: "无",
  未未: "无",
  未申: "同宫", 申未: "同宫",
  未酉: "无", 酉未: "无",
  未戌: "半三刑", 戌未: "半三刑",
  未亥: "无", 亥未: "无",
  申申: "无",
  申酉: "半三会金", 酉申: "半三会金",
  申戌: "无", 戌申: "无",
  申亥: "相害", 亥申: "相害",
  酉酉: "自刑",
  酉戌: "相害", 戌酉: "相害",
  酉亥: "无", 亥酉: "无",
  戌戌: "无",
  戌亥: "同宫", 亥戌: "同宫",
  亥亥: "自刑",
};

// ── 八卦方位数转换表（步骤六新增）─────────────────────────
// 八卦数（value%8，0视为8）→ 八卦方位数（用于九星查表）
const BAGUA_TO_POSITION: Record<number, number> = {
  1: 6, 2: 7, 3: 9, 4: 3,
  5: 4, 6: 1, 7: 8, 8: 2, 0: 2,
};

// ── 九星表（步骤六）────────────────────────────────────────
interface NineStarEntry {
  name: NineStarName;
  wuXing: WuXing;
  fortune: "吉" | "凶";
}

const NINE_STAR_MAP: Record<string, NineStarEntry> = {};

// 生气：木，吉
for (const code of ["14","41","67","76","28","82","39","93"]) {
  NINE_STAR_MAP[code] = { name: "生气", wuXing: "木", fortune: "吉" };
}
// 延年：金，吉
for (const code of ["19","91","78","87","34","43","26","62"]) {
  NINE_STAR_MAP[code] = { name: "延年", wuXing: "金", fortune: "吉" };
}
// 天医：土，吉
for (const code of ["13","31","86","68","72","27","49","94"]) {
  NINE_STAR_MAP[code] = { name: "天医", wuXing: "土", fortune: "吉" };
}
// 伏位：木，吉
for (const code of ["11","22","33","44","55","66","77","88","99"]) {
  NINE_STAR_MAP[code] = { name: "伏位", wuXing: "木", fortune: "吉" };
}
// 祸害：土，凶
for (const code of ["17","71","98","89","46","64","32","23"]) {
  NINE_STAR_MAP[code] = { name: "祸害", wuXing: "土", fortune: "凶" };
}
// 六煞：水，凶
for (const code of ["16","61","47","74","38","83","92","29"]) {
  NINE_STAR_MAP[code] = { name: "六煞", wuXing: "水", fortune: "凶" };
}
// 五鬼：火，凶
for (const code of ["18","81","79","97","36","63","42","24"]) {
  NINE_STAR_MAP[code] = { name: "五鬼", wuXing: "火", fortune: "凶" };
}
// 绝命：金，凶
for (const code of ["12","21","69","96","84","48","37","73"]) {
  NINE_STAR_MAP[code] = { name: "绝命", wuXing: "金", fortune: "凶" };
}

// 九星含义
export const NINE_STAR_MEANING: Record<NineStarName, string> = {
  生气: "旺财旺丁、事业腾飞、人缘桃花、贵人扶持、添子添福",
  延年: "健康长寿、婚姻和睦、事业稳定、人缘好、稳财",
  天医: "身体健康、祛病消灾、贵人相助、聚财稳家",
  伏位: "家宅平安、根基稳固、守财、无大凶、平稳发展",
  绝命: "重病、破财、伤亡、绝嗣、横祸、家破人亡",
  五鬼: "口舌官非、火灾、小人、破财、怪事、是非连连",
  六煞: "烂桃花、破财、抑郁、人际不和、口舌纠纷、情绪不稳",
  祸害: "官司争吵、小病不断、耗财、是非、烦扰、人缘差",
};

// ── 能量点定义（24项）────────────────────────────────────
interface EnergyPointDef {
  key: string;
  label: string;
  meaning: string;
  // 计算函数：返回数值（null = 数据不足无法计算）
  calc: (v: EnergyVars) => number | null;
}

interface EnergyVars {
  surname: number;
  nameFirst: number;
  nameLast: number | null;  // null when no 字 (single-char given name)
  ownZodiac: number;
  fatherSurname: number | null;
  fatherZodiac: number | null;
  motherSurname: number | null;
  motherZodiac: number | null;
  childZodiac: number | null;
}

const ENERGY_POINT_DEFS: EnergyPointDef[] = [
  {
    key: "天格", label: "天格", meaning: "早年运势",
    calc: (v) => v.surname,
  },
  {
    key: "人格", label: "人格", meaning: "中年运势，在六亲关系中代表自己",
    calc: (v) => v.nameFirst + (v.nameLast ?? 0),
  },
  {
    key: "地格", label: "地格", meaning: "晚年运势",
    calc: (v) => v.nameLast, // null when no 字 → row blank
  },
  {
    key: "财格", label: "财格", meaning: "自己的财运",
    calc: (v) => v.surname + v.nameFirst + (v.nameLast ?? 0),
  },
  {
    key: "灵格", label: "灵格", meaning: "与外界总体关系",
    calc: (v) => v.ownZodiac,
  },
  {
    key: "总格", label: "总格", meaning: "总体运势",
    calc: (v) => v.surname + v.nameFirst + (v.nameLast ?? 0) + v.ownZodiac,
  },
  {
    key: "父亲", label: "父亲", meaning: "父亲在该姓名局中的情况",
    calc: (v) => v.fatherSurname !== null && v.fatherZodiac !== null
      ? v.fatherSurname + v.fatherZodiac : null,
  },
  {
    key: "母亲", label: "母亲", meaning: "母亲在该姓名局中的情况",
    calc: (v) => v.motherSurname !== null && v.motherZodiac !== null
      ? v.motherSurname + v.motherZodiac : null,
  },
  {
    key: "长辈", label: "长辈", meaning: "自己和长辈的缘分",
    calc: (v) => v.fatherSurname !== null && v.motherSurname !== null
      ? v.fatherSurname + v.motherSurname : null,
  },
  {
    key: "兄弟", label: "兄弟", meaning: "看兄弟关系",
    calc: (v) => v.fatherSurname !== null
      ? v.fatherSurname + v.nameFirst : null,
  },
  {
    key: "姊妹", label: "姊妹", meaning: "看姊妹关系",
    calc: (v) => v.motherSurname !== null
      ? v.motherSurname + v.nameFirst : null,
  },
  {
    key: "兄妹", label: "兄妹", meaning: "看兄妹关系",
    calc: (v) => v.fatherSurname !== null && v.motherSurname !== null
      ? v.fatherSurname + v.motherSurname + v.nameFirst : null,
  },
  {
    key: "同事", label: "同事", meaning: "看同事关系",
    calc: (v) => v.ownZodiac + v.nameFirst,
  },
  {
    key: "儿子", label: "儿子", meaning: "儿子的能量点，可看是否有儿子及儿子情况",
    calc: (v) => v.fatherSurname !== null
      ? v.fatherSurname + (v.nameLast ?? v.nameFirst) : null,
  },
  {
    key: "女儿", label: "女儿", meaning: "女儿能量点，女儿情况",
    calc: (v) => v.motherSurname !== null
      ? v.motherSurname + (v.nameLast ?? v.nameFirst) : null,
  },
  {
    key: "长辈与子女", label: "长辈与子女", meaning: "长辈与子女缘分",
    calc: (v) => v.fatherSurname !== null && v.motherSurname !== null
      ? v.fatherSurname + v.motherSurname + (v.nameLast ?? v.nameFirst) : null,
  },
  {
    key: "自己与孩子", label: "自己与孩子", meaning: "自己与子女缘分",
    calc: (v) => v.ownZodiac + (v.nameLast ?? v.nameFirst),
  },
  {
    key: "孩子与其朋友", label: "孩子与其朋友", meaning: "自己孩子与其朋友关系",
    calc: (v) => v.childZodiac !== null
      ? v.childZodiac + (v.nameLast ?? v.nameFirst) : null,
  },
  {
    key: "情人", label: "情人", meaning: "自己与情人缘分",
    calc: (v) => v.fatherSurname !== null
      ? v.fatherSurname + v.ownZodiac : null,
  },
  {
    key: "配偶", label: "配偶", meaning: "自己与配偶缘分",
    calc: (v) => v.motherSurname !== null
      ? v.motherSurname + v.ownZodiac : null,
  },
  {
    key: "异性缘", label: "异性缘", meaning: "自己的异性缘",
    calc: (v) => v.fatherSurname !== null && v.motherSurname !== null
      ? v.fatherSurname + v.motherSurname + v.ownZodiac : null,
  },
  {
    key: "财帛宫", label: "财帛宫", meaning: "自己的钱财情况",
    calc: (v) => v.fatherSurname !== null && v.motherSurname !== null
      ? v.fatherSurname + v.motherSurname + v.nameFirst + (v.nameLast ?? 0) : null,
  },
  {
    key: "事业宫", label: "事业宫", meaning: "自己的事业情况",
    calc: (v) => {
      if (v.fatherSurname === null || v.motherSurname === null) return null;
      const caiBo = v.fatherSurname + v.motherSurname + v.nameFirst + (v.nameLast ?? 0);
      return caiBo + v.ownZodiac;
    },
  },
  {
    key: "机缘宫", label: "机缘宫", meaning: "自己的机遇情况",
    calc: (v) => v.ownZodiac + v.nameFirst + (v.nameLast ?? 0),
  },
];

// ── 工具函数 ───────────────────────────────────────────────

function toBagua(value: number): number {
  const r = value % 8;
  return r === 0 ? 8 : r;
}

function toTianGan(value: number): string {
  const r = value % 10;
  return TIAN_GAN_MAP[r];
}

function toDiZhi(value: number): string {
  const r = value % 12;
  return DI_ZHI_MAP[r];
}

function getNineStar(pointBagua: number, renGeBagua: number): NineStarEntry | null {
  const pointPos = BAGUA_TO_POSITION[pointBagua] ?? 1;
  const renGePos = BAGUA_TO_POSITION[renGeBagua] ?? 1;
  const code = `${pointPos}${renGePos}`;
  return NINE_STAR_MAP[code] ?? null;
}

// ── 主计算函数 ─────────────────────────────────────────────

export function analyzeEnergyPoints(
  surnameStrokes: number,
  nameFirstStrokes: number,
  nameLastStrokes: number | null,
  ownZodiac: ZodiacAnimal,
  opts: {
    fatherSurnameStrokes?: number | null;
    fatherZodiac?: ZodiacAnimal | null;
    motherSurnameStrokes?: number | null;
    motherZodiac?: ZodiacAnimal | null;
    childZodiac?: ZodiacAnimal | null;
  }
): EnergyAnalysis {
  const vars: EnergyVars = {
    surname: surnameStrokes,
    nameFirst: nameFirstStrokes,
    nameLast: nameLastStrokes,
    ownZodiac: ZODIAC_NUMBER[ownZodiac],
    fatherSurname: opts.fatherSurnameStrokes ?? null,
    fatherZodiac: opts.fatherZodiac ? ZODIAC_NUMBER[opts.fatherZodiac] : null,
    motherSurname: opts.motherSurnameStrokes ?? null,
    motherZodiac: opts.motherZodiac ? ZODIAC_NUMBER[opts.motherZodiac] : null,
    childZodiac: opts.childZodiac ? ZODIAC_NUMBER[opts.childZodiac] : null,
  };

  // 人格固定参数（字缺时 nameLast=null，人格 = 名笔画）
  const renGeValue = nameFirstStrokes + (nameLastStrokes ?? 0);
  const renGeDiZhi = toDiZhi(renGeValue);
  const renGeDiZhiWuXing = DI_ZHI_WUXING[renGeDiZhi];
  const renGeBagua = toBagua(renGeValue);
  const renGeNineStar = getNineStar(renGeBagua, renGeBagua);
  const renGeNineStarWuXing: WuXing = renGeNineStar?.wuXing ?? "木";

  const points: EnergyPoint[] = ENERGY_POINT_DEFS.map((def) => {
    const value = def.calc(vars);

    if (value === null) {
      return {
        key: def.key, label: def.label, meaning: def.meaning,
        value: null, tianGan: null, diZhi: null, diZhiWuXing: null,
        diZhiFortune: null, diZhiRelation: null,
        bagua: null, nineStar: null, nineStarWuXing: null,
        nineStarSelfFortune: null, nineStarFortune: null,
      };
    }

    const tianGan = toTianGan(value);
    const diZhi = toDiZhi(value);
    const diZhiWuXing = DI_ZHI_WUXING[diZhi];

    // 步骤四：地支五行吉凶（人格自身比肩为大吉）
    const diZhiFortune = def.key === "人格"
      ? "大吉"
      : compareWuXing(diZhiWuXing, renGeDiZhiWuXing);

    // 步骤五：刑冲合害
    const diZhiRelation = def.key === "人格"
      ? "无"
      : (DI_ZHI_RELATION[`${diZhi}${renGeDiZhi}`] ?? "无");

    // 步骤六：九星
    const bagua = toBagua(value);
    const nineStarEntry = getNineStar(bagua, renGeBagua);
    const nineStar = nineStarEntry?.name ?? null;
    const nineStarWuXing = nineStarEntry?.wuXing ?? null;
    const nineStarSelfFortune = nineStarEntry?.fortune ?? null;

    // 步骤七：九星五行吉凶
    const nineStarFortune: EnergyFortune | null = nineStarWuXing
      ? (def.key === "人格" ? "大吉" : compareWuXing(nineStarWuXing, renGeNineStarWuXing))
      : null;

    return {
      key: def.key, label: def.label, meaning: def.meaning, value,
      tianGan, diZhi, diZhiWuXing, diZhiFortune, diZhiRelation,
      bagua, nineStar, nineStarWuXing, nineStarSelfFortune, nineStarFortune,
    };
  });

  return {
    renGeValue,
    renGeDiZhi,
    renGeDiZhiWuXing,
    renGeBagua,
    renGeNineStarWuXing,
    points,
  };
}
