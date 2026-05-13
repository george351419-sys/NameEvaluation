import type { AnalysisResult } from "@/types";

export const SYSTEM_PROMPT = `你是一位精通中国传统命理学的专业命理师，擅长笔画数命理、梅花易数和干支能量点分析。

你的解读应当：
1. 基于提供的排盘数据给出准确的命理解读
2. 语言亲切自然，深入浅出，有温度
3. 结合早年、中年、晚年的人生阶段分析
4. 对财运、事业、感情、六亲等方面给出具体指引
5. 保持正面积极的引导，对凶象也指出化解之道

请按照以下 Markdown 格式输出：

## 整体运势概览

[基于三大分析模块综合分析，200字左右]

## 人生三阶段

### 早年（天格×本卦）
[结合天格地支五行吉凶、九星，以及本卦体用关系，150字左右]

### 中年（人格×互卦）
[人格为中年核心，结合互卦体用关系分析，150字左右]

### 晚年（地格×变卦）
[结合地格能量点及变卦体用关系，150字左右]

## 财富运势

[结合财格、财帛宫能量点和笔画数分析，150字左右]

## 事业仕途

[结合事业宫、总格能量点分析，150字左右]

## 感情婚姻

[结合情人、妻子、异性缘能量点分析，150字左右]

## 六亲缘分

[结合父亲、母亲、兄弟、姊妹、儿子、女儿各能量点分析，200字左右]

## 开运化解建议

[根据凶象，给出3-5条具体可行的化解建议]`;

export function buildUserPrompt(data: AnalysisResult): string {
  const { strokeAnalysis, plumBlossom, energyAnalysis } = data;

  // 过滤出有数据的能量点
  const validPoints = energyAnalysis.points.filter((p) => p.value !== null);

  return `请为以下命主进行全面命理解读：

**姓名**：${data.input.surname}${data.input.givenName}（姓${data.nameParts.surname}，名${data.nameParts.nameFirst}，字${data.nameParts.nameLast}）
**出生日期**：${data.input.birthDate}（${data.input.isLunar ? "农历" : "阳历"}）

---

## 一、笔画数分析

| 项目 | 拆解 | 笔画 | 吉凶 | 断语 |
|------|------|------|------|------|
| 姓 | ${strokeAnalysis.results.surname.char} | ${strokeAnalysis.results.surname.strokes} | ${strokeAnalysis.results.surname.fortune} | ${strokeAnalysis.results.surname.meaning} |
| 名 | ${strokeAnalysis.results.nameFirst.char} | ${strokeAnalysis.results.nameFirst.strokes} | ${strokeAnalysis.results.nameFirst.fortune} | ${strokeAnalysis.results.nameFirst.meaning} |
| 字 | ${strokeAnalysis.results.nameLast.char} | ${strokeAnalysis.results.nameLast.strokes} | ${strokeAnalysis.results.nameLast.fortune} | ${strokeAnalysis.results.nameLast.meaning} |

---

## 二、梅花易数

生肖：${plumBlossom.zodiac}（动爻第${plumBlossom.movingYao}爻）
上卦：${plumBlossom.upperGua} | 下卦：${plumBlossom.lowerGua}

| 阶段 | 卦 | 体 | 用 | 体用关系 | 吉凶 | 解读 |
|------|----|----|----|---------|----|------|
${plumBlossom.stages
  .map(
    (s) =>
      `| ${s.stage}（${s.type}） | ${s.hexagram.name} | ${s.body}(${s.bodyWuxing}) | ${s.use}(${s.useWuxing}) | ${s.relation} | ${s.fortune} | ${s.interpretation} |`
  )
  .join("\n")}

---

## 三、能量点排盘

人格基准：${energyAnalysis.renGeDiZhi}（${energyAnalysis.renGeDiZhiWuXing}），八卦数 ${energyAnalysis.renGeBagua}

| 能量点 | 干支 | 地支五行吉凶 | 地支关系 | 九星 | 九星本身吉凶 | 九星五行吉凶 |
|--------|------|------------|---------|------|------------|------------|
${validPoints
  .map(
    (p) =>
      `| ${p.label}（${p.meaning.slice(0, 6)}） | ${p.tianGan}${p.diZhi} | ${p.diZhiFortune} | ${p.diZhiRelation ?? "无"} | ${p.nineStar ?? "—"} | ${p.nineStarSelfFortune ?? "—"} | ${p.nineStarFortune ?? "—"} |`
  )
  .join("\n")}

---

请基于以上排盘数据，给出专业、深入、有温度的命理解读。`;
}
