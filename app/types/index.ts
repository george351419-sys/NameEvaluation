export interface NameInput {
  surname: string;
  givenName: string;
  birthDate: string; // ISO date string，直接选生肖时为空字符串
  isLunar: boolean;
  zodiacOverride?: string; // 直接选生肖时使用，优先于 birthDate 推算
  fatherSurname?: string;
  fatherZodiac?: string;
  motherSurname?: string;
  motherZodiac?: string;
  childZodiac?: string;
}

export interface StrokeResult {
  char: string;
  strokes: number;
  fortune: "吉" | "凶" | "半吉" | "半凶" | "大吉" | "大凶";
  meaning: string;
}

export interface NameParts {
  surname: string;
  nameFirst: string; // 名
  nameLast: string;  // 字
}

export interface StrokeAnalysis {
  parts: NameParts;
  results: {
    surname: StrokeResult;
    nameFirst: StrokeResult;
    nameLast: StrokeResult;
  };
}

export type Bagua = "乾" | "兑" | "离" | "震" | "巽" | "坎" | "艮" | "坤";
export type WuXing = "金" | "火" | "木" | "水" | "土";
export type ZodiacAnimal =
  | "鼠" | "牛" | "虎" | "兔" | "龙" | "蛇"
  | "马" | "羊" | "猴" | "鸡" | "狗" | "猪";

export interface Hexagram {
  name: string;
  upper: Bagua;
  lower: Bagua;
  symbol: string; // six-line representation
}

export type LifeStage = "早年" | "中年" | "晚年" | "早期" | "中期" | "后期";

export interface PlumBlossomStage {
  stage: LifeStage;
  type: "本卦" | "互卦" | "变卦";
  hexagram: Hexagram;
  body: Bagua;
  use: Bagua;
  bodyWuxing: WuXing;
  useWuxing: WuXing;
  relation: "用生体" | "体用比肩" | "体克用" | "用克体" | "体生用";
  fortune: "大吉" | "吉" | "小吉" | "凶" | "大凶";
  interpretation: string;
}

export interface PlumBlossomAnalysis {
  zodiac: ZodiacAnimal;
  movingYao: number;
  upperGua: Bagua;
  lowerGua: Bagua;
  stages: PlumBlossomStage[];
}

// ── 能量点相关类型 ─────────────────────────────────────────

export type EnergyFortune = "大吉" | "吉" | "小吉" | "小凶" | "凶" | "大凶";

// 九星名称
export type NineStarName =
  | "生气" | "延年" | "天医" | "伏位"
  | "祸害" | "六煞" | "五鬼" | "绝命";

export interface EnergyPoint {
  key: string;           // 能量点key（如 "天格"）
  label: string;         // 显示名
  meaning: string;       // 含义（如 "早年运势"）
  value: number | null;  // 数值
  tianGan: string | null;       // 天干
  diZhi: string | null;         // 地支
  diZhiWuXing: WuXing | null;   // 地支五行
  diZhiFortune: EnergyFortune | null; // 地支五行吉凶（与人格比较）
  diZhiRelation: string | null; // 地支刑冲合害关系
  // 九星
  bagua: number | null;         // 八卦数（数值%8，0→8）
  nineStar: NineStarName | null;
  nineStarWuXing: WuXing | null;
  nineStarSelfFortune: "吉" | "凶" | null; // 九星本身吉凶
  nineStarFortune: EnergyFortune | null;    // 九星五行与人格比较吉凶
}

export interface EnergyAnalysis {
  renGeValue: number;        // 人格数值（用于比较）
  renGeDiZhi: string;        // 人格地支
  renGeDiZhiWuXing: WuXing;  // 人格地支五行
  renGeBagua: number;        // 人格八卦数
  renGeNineStarWuXing: WuXing; // 人格九星五行
  points: EnergyPoint[];
}

export interface AnalysisResult {
  input: NameInput;
  nameParts: NameParts;
  strokeAnalysis: StrokeAnalysis;
  plumBlossom: PlumBlossomAnalysis;
  energyAnalysis: EnergyAnalysis;
}

// ── 公司评测相关类型 ────────────────────────────────────────

export interface CompanyInput {
  companyName: string;
  founderName: string;
  partnerNames: string[];
}

export interface CompanyStrokeAnalysis {
  chars: StrokeResult[];
  totalStrokes: number;
}

export type CompanyEnergyFieldType = "company_char" | "company_total" | "founder" | "partner";

export interface CompanyEnergyPoint {
  key: string;
  label: string;
  mapValue: string;
  meaning: string;
  value: number;
  fieldType: CompanyEnergyFieldType;
  tianGan: string;
  diZhi: string;
  diZhiWuXing: WuXing;
  diZhiFortune: EnergyFortune;
  diZhiRelation: string;
  bagua: number;
  nineStar: NineStarName | null;
  nineStarWuXing: WuXing | null;
  nineStarSelfFortune: "吉" | "凶" | null;
  nineStarFortune: EnergyFortune | null;
}

export interface CompanyEnergyAnalysis {
  zongGeValue: number;
  zongGeDiZhi: string;
  zongGeDiZhiWuXing: WuXing;
  zongGeBagua: number;
  zongGeNineStarWuXing: WuXing;
  points: CompanyEnergyPoint[];
}

export interface CompanyAnalysisResult {
  input: CompanyInput;
  strokeAnalysis: CompanyStrokeAnalysis;
  plumBlossom: PlumBlossomAnalysis;
  energyAnalysis: CompanyEnergyAnalysis;
}
