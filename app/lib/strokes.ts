import type { StrokeResult, NameParts } from "@/types";
import strokeData from "./strokeData.json";

// 81 笔画吉凶表（1-81）
const STROKE_FORTUNE: Record<
  number,
  { fortune: StrokeResult["fortune"]; meaning: string }
> = {
  1: { fortune: "吉", meaning: "元亨利贞，开创、首领、富贵延年" },
  2: { fortune: "凶", meaning: "动荡不安，力弱无援、劳而无功、根基浅" },
  3: { fortune: "吉", meaning: "万物定形，贵人多助、名利双收、领导格" },
  4: { fortune: "凶", meaning: "坎坷多难，苦难折磨、有志难伸、万事休止" },
  5: { fortune: "吉", meaning: "阴阳和合，福禄长寿、人缘佳、一门兴隆" },
  6: { fortune: "吉", meaning: "安稳余庆，天赐幸运、祖荫厚、平顺成功" },
  7: { fortune: "吉", meaning: "刚毅果断，精力旺盛、排除万难、独立权威" },
  8: { fortune: "半吉", meaning: "勤勉发展，意志坚刚、前难后成、稳健发达" },
  9: { fortune: "凶", meaning: "奇才难展，有才无命、孤独、财利难望" },
  10: { fortune: "凶", meaning: "乌云遮月，暗淡无光、徒劳心力、空费功夫" },
  11: { fortune: "吉", meaning: "草木逢春，稳健踏实、得人望、绝处逢生" },
  12: { fortune: "凶", meaning: "薄弱无力，孤立无援、外祥内苦、谋事难成" },
  13: { fortune: "吉", meaning: "天赋吉运，智慧超群、善用谋略、必获成功" },
  14: { fortune: "凶", meaning: "浮沉破败，忍苦耐劳、孤立无援、成败无常" },
  15: { fortune: "吉", meaning: "福寿圆满，谦恭和顺、大事成就、一门兴隆" },
  16: { fortune: "吉", meaning: "厚重载德，众望所归、名利双收、盟主四方" },
  17: { fortune: "半吉", meaning: "刚健不屈，排除万难、贵人相助、把握时机" },
  18: { fortune: "半吉", meaning: "权威显达，经商顺利、慎始慎终、百事亨通" },
  19: { fortune: "凶", meaning: "风云蔽日，成功早而不稳、内外不和、障碍重重" },
  20: { fortune: "凶", meaning: "屋下藏金，非业破运、灾难重重、进退维谷" },
  21: { fortune: "吉", meaning: "明月中天，官运亨通、大搏名利、首领之格" },
  22: { fortune: "凶", meaning: "秋草逢霜，时运不济、薄弱乏力、诸事难成" },
  23: { fortune: "吉", meaning: "旭日东升，壮丽荣达、名扬四方、首领运强" },
  24: { fortune: "吉", meaning: "掘藏得金，先苦后甘、白手起家、财源广进" },
  25: { fortune: "半吉", meaning: "资性英敏，英俊刚毅、聪慧过人、修身养性" },
  26: { fortune: "凶", meaning: "变怪奇异，波澜重叠、千变万化、吉凶两极" },
  27: { fortune: "凶", meaning: "增长盛衰，成败循环、早年风光、中年后衰" },
  28: { fortune: "凶", meaning: "阔水浮萍，漂泊不定、财来财去、易受中伤" },
  29: { fortune: "吉", meaning: "智谋奋进，多智善谋、名利双收、富贵荣华" },
  30: { fortune: "半吉", meaning: "浮沉不定，祸福相依、劳心劳力、成败难料" },
  31: { fortune: "吉", meaning: "春日花开，智勇双全、事业有成、家门隆昌" },
  32: { fortune: "吉", meaning: "宝马金鞍，侥幸多望、贵人得助、财官双美" },
  33: { fortune: "吉", meaning: "家门隆昌，才德开展、权威显达、富贵至极" },
  34: { fortune: "凶", meaning: "破家亡身，灾难频发、家破人亡、离乱之数" },
  35: { fortune: "吉", meaning: "高楼望月，温和贤淑、平稳发展、女性吉数" },
  36: { fortune: "半凶", meaning: "波澜重叠，风浪不息、劳而无功、常陷困苦" },
  37: { fortune: "吉", meaning: "猛虎出林，权威显达、热诚果敢、成就大业" },
  38: { fortune: "半吉", meaning: "磨铁成针，技艺成名、缺乏魄力、小成即可" },
  39: { fortune: "半吉", meaning: "富贵荣华，权威至极、财官双美、福寿绵长" },
  40: { fortune: "凶", meaning: "谨慎保安，谨慎守旧、进退两难、难得成功" },
  41: { fortune: "吉", meaning: "德望高大，纯阳独秀、事事如意、名利双全" },
  42: { fortune: "凶", meaning: "寒蝉在柳，博而不精、华而不实、劳心劳力" },
  43: { fortune: "凶", meaning: "散财破产，外祥内苦、破财难免、防意难周" },
  44: { fortune: "凶", meaning: "烦闷破兆，事难顺遂、劳神费力、灾祸频仍" },
  45: { fortune: "吉", meaning: "顺风扬帆，新生泰和、一帆风顺、成功可期" },
  46: { fortune: "凶", meaning: "浪里淘金，劳而无获、辛苦波折、难成大业" },
  47: { fortune: "吉", meaning: "点石成金，开花结果、权威进取、名利双收" },
  48: { fortune: "吉", meaning: "古松立鹤，德智兼备、富贵长寿、官运亨通" },
  49: { fortune: "半吉", meaning: "变转吉凶，吉凶难定、先苦后甘、谨慎则吉" },
  50: { fortune: "半吉", meaning: "小舟入海，一成一败、浮沉不定、需防凶险" },
  51: { fortune: "半吉", meaning: "沉浮盛衰，一盛一衰、先难后易、守成则安" },
  52: { fortune: "吉", meaning: "达眼远见，先见之明、名利双收、富贵可期" },
  53: { fortune: "凶", meaning: "外强中干，早年顺利、晚运衰微、艰辛困苦" },
  54: { fortune: "凶", meaning: "内忧外患，障碍重重、有志难伸、郁郁不平" },
  55: { fortune: "半吉", meaning: "外观昌隆，内隐祸患、外柔内刚、先难后易" },
  56: { fortune: "凶", meaning: "浪里行舟，优柔寡断、保守无能、前途暗淡" },
  57: { fortune: "吉", meaning: "寒雪青松，不屈不挠、时来运转、晚运亨通" },
  58: { fortune: "半吉", meaning: "晚行遇月，浮沉多端、先苦后乐、中年转运" },
  59: { fortune: "凶", meaning: "寒蝉悲风，犹豫不决、半途而废、缺乏胆识" },
  60: { fortune: "凶", meaning: "无谋失算，心迷意乱、无勇无谋、徒劳无功" },
  61: { fortune: "吉", meaning: "名利双收，修德养性、奋发向上、富贵荣华" },
  62: { fortune: "凶", meaning: "基础虚弱，欠缺诚信、难得贵人、运途闭塞" },
  63: { fortune: "吉", meaning: "事事如意，贤能有德、进取向上、功成名就" },
  64: { fortune: "凶", meaning: "非命破败，刚愎自用、半途而废、终难得志" },
  65: { fortune: "吉", meaning: "富贵康寿，广结善缘、家门显贵、福禄吉祥" },
  66: { fortune: "凶", meaning: "内外不和，有志难伸、六亲缘薄、劳心劳力" },
  67: { fortune: "吉", meaning: "通达顺遂，八面玲珑、自立兴家、好运四通" },
  68: { fortune: "吉", meaning: "发明进取，聪慧灵敏、意志坚定、财富名望" },
  69: { fortune: "凶", meaning: "动荡不安，时运不济、意外频仍、事业难成" },
  70: { fortune: "凶", meaning: "残灯复明，纷争不断、坐困愁城、难脱困苦" },
  71: { fortune: "半吉", meaning: "沉湎安乐，忠厚老成、难成大事、享福之数" },
  72: { fortune: "半吉", meaning: "祸福相依，短暂幸福、风雨欲来、难安顺遂" },
  73: { fortune: "半吉", meaning: "志高力微，进取向上、稳健踏实、成功可期" },
  74: { fortune: "凶", meaning: "沉沦逆境，衰败孤寂、无谋无勇、一事无成" },
  75: { fortune: "半凶", meaning: "保守得安，急躁难成、退守则吉、进取则凶" },
  76: { fortune: "凶", meaning: "离散破败，内外不和、劳而无功、竹篮打水" },
  77: { fortune: "半吉", meaning: "吉凶参半，乐极生悲、劳碌无成、防人之心" },
  78: { fortune: "半凶", meaning: "晚运凄凉，中年发迹、晚年困苦、先吉后凶" },
  79: { fortune: "凶", meaning: "挽回乏力，精神不定、失节丧信、受人责难" },
  80: { fortune: "凶", meaning: "一生劳苦，孤独空虚、劳而无得、障碍病难" },
  81: { fortune: "吉", meaning: "还原复始，隆昌尊贵、家门兴隆、名扬四海" },
};

// 笔画数 > 81 时取余数（循环）
function normalizStrokes(n: number): number {
  if (n <= 0) return 1;
  const mod = n % 81;
  return mod === 0 ? 81 : mod;
}

const STROKE_DATA = strokeData as Record<string, number>;

export function getStrokeCount(char: string): number {
  return STROKE_DATA[char] ?? 1;
}

export function getTotalStrokes(text: string): number {
  return text.split("").reduce((sum, char) => sum + getStrokeCount(char), 0);
}

export function getStrokeFortune(strokes: number): StrokeResult {
  const normalized = normalizStrokes(strokes);
  const entry = STROKE_FORTUNE[normalized];
  return {
    char: "",
    strokes,
    fortune: entry?.fortune ?? "吉",
    meaning: entry?.meaning ?? "",
  };
}

// 将"名"拆分为"名"和"字"
// 偶数：均分；奇数：前多（名多字少）
export function splitGivenName(givenName: string): { nameFirst: string; nameLast: string } {
  const len = givenName.length;
  if (len === 0) return { nameFirst: "", nameLast: "" };
  if (len === 1) return { nameFirst: givenName, nameLast: "" };
  const split = Math.ceil(len / 2);
  return {
    nameFirst: givenName.slice(0, split),
    nameLast: givenName.slice(split),
  };
}

export function analyzeStrokes(surname: string, givenName: string) {
  const { nameFirst, nameLast } = splitGivenName(givenName);

  const surnameStrokes = getTotalStrokes(surname);
  const nameFirstStrokes = getTotalStrokes(nameFirst);
  const nameLastStrokes = nameLast ? getTotalStrokes(nameLast) : 0;

  const nameLastResult: StrokeResult = nameLast
    ? { ...getStrokeFortune(nameLastStrokes), char: nameLast, strokes: nameLastStrokes }
    : { char: "", strokes: 0, fortune: "吉", meaning: "" };

  return {
    parts: { surname, nameFirst, nameLast: nameLast || nameFirst } as NameParts,
    results: {
      surname: { ...getStrokeFortune(surnameStrokes), char: surname, strokes: surnameStrokes },
      nameFirst: { ...getStrokeFortune(nameFirstStrokes), char: nameFirst, strokes: nameFirstStrokes },
      nameLast: nameLastResult,
    },
  };
}
