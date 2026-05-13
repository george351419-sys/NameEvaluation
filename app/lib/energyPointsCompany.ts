import type {
  WuXing,
  EnergyFortune,
  NineStarName,
  CompanyEnergyAnalysis,
  CompanyEnergyPoint,
  CompanyEnergyFieldType,
} from "@/types";

// ── 天干/地支/五行表（与 energyPoints.ts 相同）────────────────

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

const BAGUA_TO_POSITION: Record<number, number> = {
  1: 6, 2: 7, 3: 9, 4: 3,
  5: 4, 6: 1, 7: 8, 8: 2, 0: 2,
};

interface NineStarEntry {
  name: NineStarName;
  wuXing: WuXing;
  fortune: "吉" | "凶";
}

const NINE_STAR_MAP: Record<string, NineStarEntry> = {};
for (const code of ["14","41","67","76","28","82","39","93"]) {
  NINE_STAR_MAP[code] = { name: "生气", wuXing: "木", fortune: "吉" };
}
for (const code of ["19","91","78","87","34","43","26","62"]) {
  NINE_STAR_MAP[code] = { name: "延年", wuXing: "金", fortune: "吉" };
}
for (const code of ["13","31","86","68","72","27","49","94"]) {
  NINE_STAR_MAP[code] = { name: "天医", wuXing: "土", fortune: "吉" };
}
for (const code of ["11","22","33","44","55","66","77","88","99"]) {
  NINE_STAR_MAP[code] = { name: "伏位", wuXing: "木", fortune: "吉" };
}
for (const code of ["17","71","98","89","46","64","32","23"]) {
  NINE_STAR_MAP[code] = { name: "祸害", wuXing: "土", fortune: "凶" };
}
for (const code of ["16","61","47","74","38","83","92","29"]) {
  NINE_STAR_MAP[code] = { name: "六煞", wuXing: "水", fortune: "凶" };
}
for (const code of ["18","81","79","97","36","63","42","24"]) {
  NINE_STAR_MAP[code] = { name: "五鬼", wuXing: "火", fortune: "凶" };
}
for (const code of ["12","21","69","96","84","48","37","73"]) {
  NINE_STAR_MAP[code] = { name: "绝命", wuXing: "金", fortune: "凶" };
}

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

function getNineStar(pointBagua: number, refBagua: number): NineStarEntry | null {
  const pointPos = BAGUA_TO_POSITION[pointBagua] ?? 1;
  const refPos = BAGUA_TO_POSITION[refBagua] ?? 1;
  const code = `${pointPos}${refPos}`;
  return NINE_STAR_MAP[code] ?? null;
}

// compareWuXing(point, reference):
// - point 生 ref → 吉 (点生参考)
// - point == ref → 大吉 (比肩)
// - ref 克 point → 小吉 (参考克点)
// - ref 生 point → 小凶 (参考生点，耗散)
// - point 克 ref → 大凶 (点克参考)
function compareWuXing(pointWx: WuXing, refWx: WuXing): EnergyFortune {
  if (pointWx === refWx) return "大吉";
  if (GENERATES[pointWx] === refWx) return "吉";
  if (OVERCOMES[refWx] === pointWx) return "小吉";
  if (GENERATES[refWx] === pointWx) return "小凶";
  if (OVERCOMES[pointWx] === refWx) return "大凶";
  return "吉";
}

interface FieldSpec {
  key: string;
  label: string;
  mapValue: string;
  meaning: string;
  value: number;
  fieldType: CompanyEnergyFieldType;
}

// ── 公司能量点主计算函数 ──────────────────────────────────────

export function analyzeCompanyEnergyPoints(
  companyChars: { char: string; strokes: number }[],
  founderName: string,
  founderStrokes: number,
  partners: { name: string; strokes: number }[]
): CompanyEnergyAnalysis {
  const totalStrokes = companyChars.reduce((s, c) => s + c.strokes, 0);

  // 公司总格固定参数
  const zongGeDiZhi = toDiZhi(totalStrokes);
  const zongGeDiZhiWuXing = DI_ZHI_WUXING[zongGeDiZhi];
  const zongGeBagua = toBagua(totalStrokes);
  const zongGeNineStar = getNineStar(zongGeBagua, zongGeBagua);
  const zongGeNineStarWuXing: WuXing = zongGeNineStar?.wuXing ?? "木";

  // 构建字段定义列表（动态）
  const fields: FieldSpec[] = [
    // 公司名字各字
    ...companyChars.map((c, i) => ({
      key: `公司名字${i + 1}`,
      label: `公司名字${i + 1}（${c.char}）`,
      mapValue: c.char,
      meaning: `公司名字第${i + 1}字对总格的能量影响`,
      value: c.strokes,
      fieldType: "company_char" as CompanyEnergyFieldType,
    })),
    // 公司总格
    {
      key: "公司总格",
      label: "公司总格",
      mapValue: companyChars.map((c) => c.char).join(""),
      meaning: "公司总格（参考基准）",
      value: totalStrokes,
      fieldType: "company_total" as CompanyEnergyFieldType,
    },
    // 创始人
    {
      key: "创始人",
      label: `创始人（${founderName}）`,
      mapValue: founderName,
      meaning: "公司总格对创始人的能量影响",
      value: founderStrokes,
      fieldType: "founder" as CompanyEnergyFieldType,
    },
    // 合伙人
    ...partners.map((p, i) => ({
      key: `合伙人${i + 1}`,
      label: `合伙人${i + 1}（${p.name}）`,
      mapValue: p.name,
      meaning: `公司总格对合伙人${i + 1}的能量影响`,
      value: p.strokes,
      fieldType: "partner" as CompanyEnergyFieldType,
    })),
  ];

  const points: CompanyEnergyPoint[] = fields.map((f) => {
    const { value, fieldType } = f;
    const tianGan = toTianGan(value);
    const diZhi = toDiZhi(value);
    const diZhiWuXing = DI_ZHI_WUXING[diZhi];
    const bagua = toBagua(value);

    // 地支五行吉凶
    // - 公司总格：自身，大吉
    // - 公司名字各字：charWx vs zongGeWx（字对总格的影响）
    // - 创始人/合伙人：zongGeWx vs personWx（总格对人的影响）
    let diZhiFortune: EnergyFortune;
    if (fieldType === "company_total") {
      diZhiFortune = "大吉";
    } else if (fieldType === "company_char") {
      diZhiFortune = compareWuXing(diZhiWuXing, zongGeDiZhiWuXing);
    } else {
      // founder / partner: zongGe 对 person 的影响
      diZhiFortune = compareWuXing(zongGeDiZhiWuXing, diZhiWuXing);
    }

    // 地支刑冲合害
    const diZhiRelation =
      fieldType === "company_total"
        ? "无"
        : (DI_ZHI_RELATION[`${diZhi}${zongGeDiZhi}`] ?? "无");

    // 九星（所有字段均以 zongGe 为参考）
    const nineStarEntry = getNineStar(bagua, zongGeBagua);
    const nineStar = nineStarEntry?.name ?? null;
    const nineStarWuXing = nineStarEntry?.wuXing ?? null;
    const nineStarSelfFortune = nineStarEntry?.fortune ?? null;

    // 九星五行吉凶
    let nineStarFortune: EnergyFortune | null = null;
    if (nineStarWuXing) {
      if (fieldType === "company_total") {
        nineStarFortune = "大吉";
      } else if (fieldType === "company_char") {
        nineStarFortune = compareWuXing(nineStarWuXing, zongGeNineStarWuXing);
      } else {
        // founder / partner: zongGe 对 person
        nineStarFortune = compareWuXing(zongGeNineStarWuXing, nineStarWuXing);
      }
    }

    return {
      key: f.key,
      label: f.label,
      mapValue: f.mapValue,
      meaning: f.meaning,
      value,
      fieldType,
      tianGan,
      diZhi,
      diZhiWuXing,
      diZhiFortune,
      diZhiRelation,
      bagua,
      nineStar,
      nineStarWuXing,
      nineStarSelfFortune,
      nineStarFortune,
    };
  });

  return {
    zongGeValue: totalStrokes,
    zongGeDiZhi,
    zongGeDiZhiWuXing,
    zongGeBagua,
    zongGeNineStarWuXing,
    points,
  };
}
