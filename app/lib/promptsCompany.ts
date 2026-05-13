import type { CompanyAnalysisResult } from "@/types";

export const COMPANY_SYSTEM_PROMPT = `你是一位精通中国传统命理学的专业命理师，尤其擅长为企业和品牌进行命理分析，包括笔画数命理、梅花易数和干支能量点分析。

你的解读应当：
1. 基于提供的企业排盘数据给出准确的命理解读
2. 语言专业自然，深入浅出，有温度，适合企业主参考
3. 结合公司发展的早期、中期、长期三个阶段分析
4. 对公司财运、事业发展、核心团队关系等方面给出具体指引
5. 保持正面积极的引导，对凶象也指出化解之道

请按照以下 Markdown 格式输出：

## 企业整体运势概览

[基于三大分析模块综合分析，200字左右]

## 公司发展三阶段

### 创业期（本卦）
[结合本卦体用关系，以及公司名字各字能量，150字左右]

### 成长期（互卦）
[结合互卦体用关系分析，150字左右]

### 成熟期（变卦）
[结合变卦体用关系及总格能量，150字左右]

## 财富与商业运势

[结合公司总格、各字笔画数分析，150字左右]

## 事业与发展前景

[结合梅花易数和能量点分析，150字左右]

## 核心团队关系

[结合创始人、合伙人与公司总格的能量关系，200字左右]

## 开运化解建议

[根据凶象，给出3-5条具体可行的企业运营化解建议]`;

export function buildCompanyUserPrompt(data: CompanyAnalysisResult): string {
  const { strokeAnalysis, plumBlossom, energyAnalysis } = data;

  const strokeRows = strokeAnalysis.chars
    .map((c, i) => `| 名字${i + 1} | ${c.char} | ${c.strokes} | ${c.fortune} | ${c.meaning} |`)
    .join("\n");

  const validPoints = energyAnalysis.points;

  return `请为以下企业进行全面命理解读：

**公司名字**：${data.input.companyName}
**创始人**：${data.input.founderName}${data.input.partnerNames.length ? `，合伙人：${data.input.partnerNames.join("、")}` : ""}

---

## 一、笔画数分析

公司名字总笔画数：${strokeAnalysis.totalStrokes}

| 项目 | 字 | 笔画 | 吉凶 | 断语 |
|------|-----|------|------|------|
${strokeRows}

---

## 二、梅花易数

生肖（总格推算）：${plumBlossom.zodiac}（动爻第${plumBlossom.movingYao}爻，公司总格${data.strokeAnalysis.totalStrokes}÷6取余）
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

公司总格基准：${energyAnalysis.zongGeDiZhi}（${energyAnalysis.zongGeDiZhiWuXing}），八卦数 ${energyAnalysis.zongGeBagua}

| 字段 | 映射值 | 数值 | 干支 | 地支五行吉凶 | 九星 | 九星五行吉凶 |
|------|--------|------|------|------------|------|------------|
${validPoints
  .map(
    (p) =>
      `| ${p.label} | ${p.mapValue} | ${p.value} | ${p.tianGan}${p.diZhi} | ${p.diZhiFortune} | ${p.nineStar ?? "—"} | ${p.nineStarFortune ?? "—"} |`
  )
  .join("\n")}

---

请基于以上排盘数据，给出专业、深入、有温度的企业命理解读。`;
}
