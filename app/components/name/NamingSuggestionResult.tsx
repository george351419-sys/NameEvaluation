import React from "react";
import type { NamingResult, EnergyFortune, NineStarName } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NINE_STAR_MEANING } from "@/lib/energyPoints";

const FORTUNE_COLOR: Record<string, string> = {
  大吉: "bg-green-200 text-green-900",
  吉: "bg-green-100 text-green-800",
  小吉: "bg-lime-100 text-lime-800",
  小凶: "bg-orange-100 text-orange-800",
  凶: "bg-red-100 text-red-800",
  大凶: "bg-red-200 text-red-900",
  半吉: "bg-yellow-100 text-yellow-800",
  半凶: "bg-orange-100 text-orange-800",
};
const FORTUNE_ORDER: EnergyFortune[] = ["大吉", "吉", "小吉", "小凶", "凶", "大凶"];

function FBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  return <Badge className={`text-xs px-1.5 py-0 ${FORTUNE_COLOR[value] ?? "bg-gray-100"}`}>{value}</Badge>;
}

function FortuneStats({ counts }: { counts: Partial<Record<string, number>> }) {
  const entries = FORTUNE_ORDER.filter((k) => counts[k]);
  if (!entries.length) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-0.5">
      {entries.map((k) => (
        <span key={k} className={`inline-flex items-center gap-0.5 text-[10px] px-1 rounded ${FORTUNE_COLOR[k] ?? "bg-gray-100"}`}>
          {k}<span className="font-bold">{counts[k]}</span>
        </span>
      ))}
    </div>
  );
}

// ── Section 1: 候选能量点表格（9×12）────────────────────────

function CandidateTable({ data }: { data: NamingResult }) {
  const { candidateRows, top3X } = data;
  const pointKeys = candidateRows[0].points.map((p) => ({ key: p.key, label: p.label }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>一、能量点候选分析（名字总笔画 X = 1 ~ 12）</CardTitle>
        <p className="text-sm text-muted-foreground">
          基准：人格（= X），对比各关键能量点的地支五行吉凶
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">能量点</TableHead>
              {candidateRows.map((r) => (
                <TableHead key={r.x} className={`text-center w-[56px] ${top3X.includes(r.x) ? "bg-amber-50 font-bold text-amber-800" : ""}`}>
                  X={r.x}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pointKeys.map(({ key, label }) => (
              <TableRow key={key} className={key === "人格" ? "bg-amber-50/50" : ""}>
                <TableCell className="font-medium">{label}</TableCell>
                {candidateRows.map((r) => {
                  const pt = r.points.find((p) => p.key === key)!;
                  return (
                    <TableCell key={r.x} className={`text-center ${top3X.includes(r.x) ? "bg-amber-50/60" : ""}`}>
                      <FBadge value={pt.diZhiFortune} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell>吉凶统计</TableCell>
              {candidateRows.map((r) => (
                <TableCell key={r.x} className={`${top3X.includes(r.x) ? "bg-amber-100/60" : ""}`}>
                  <FortuneStats counts={r.fortuneCount} />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <p className="mt-2 text-xs text-muted-foreground">
          高亮列（{top3X.map((x) => `X=${x}`).join("、")}）为凶数最少的候选值
        </p>
      </CardContent>
    </Card>
  );
}

// ── Section 2: 梅花易数对比（6组）───────────────────────────

function PlumTable({ data }: { data: NamingResult }) {
  const { plumCandidates, recommended } = data;
  const stages = ["早年", "中年", "晚年"] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>二、梅花易数对比（前3组 × 2 = 6组候选）</CardTitle>
        <p className="text-sm text-muted-foreground">
          取凶数最少的3组名字数及其 +12 延伸值，分别做梅花易数推演
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">人生阶段</TableHead>
              {plumCandidates.map((c) => (
                <TableHead key={c.x} className={`text-center w-[80px] ${recommended.includes(c.x) ? "bg-amber-50 font-bold text-amber-800" : ""}`}>
                  X={c.x}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage, si) => (
              <TableRow key={stage}>
                <TableCell className="font-medium">{stage}</TableCell>
                {plumCandidates.map((c) => {
                  const s = c.plumBlossom.stages[si];
                  return (
                    <TableCell key={c.x} className={`text-center ${recommended.includes(c.x) ? "bg-amber-50/60" : ""}`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{s.hexagram.name}</span>
                        <FBadge value={s.fortune} />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium">统计</TableCell>
              {plumCandidates.map((c) => (
                <TableCell key={c.x} className={`${recommended.includes(c.x) ? "bg-amber-100/60" : ""}`}>
                  <FortuneStats counts={c.fortuneCount} />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <p className="mt-2 text-xs text-muted-foreground">
          高亮列（{recommended.map((x) => `X=${x}`).join("、")}）为最终推荐值
        </p>
      </CardContent>
    </Card>
  );
}

// ── Section 3: 最终推荐 + 完整排盘 ──────────────────────────

// 最终排盘展示的18个关键能量点
const FINAL_DISPLAY_KEYS = [
  "天格", "人格", "财格", "灵格", "总格",
  "父亲", "母亲", "长辈", "兄弟", "姊妹", "兄妹", "同事",
  "情人", "配偶", "异性缘", "财帛宫", "事业宫", "机缘宫",
];

const COL_TEXT  = ["text-amber-800",  "text-blue-800"];
const COL_BG    = ["bg-amber-50",     "bg-blue-50"];
const COL_LABEL = ["bg-amber-100 text-amber-900", "bg-blue-100 text-blue-900"];

function RecommendationSection({ data }: { data: NamingResult }) {
  const { recommended, finalAnalysis } = data;

  const stageLabels = ["早年", "中年", "晚年"] as const;

  return (
    <Card className="border-amber-300 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="text-amber-900">三、命名建议</CardTitle>
        <div className="mt-1 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
          基于人生平稳的建议，推荐名字总笔画数（名+字）为{" "}
          {recommended.map((x, i) => (
            <React.Fragment key={x}>
              {i > 0 && " 或 "}
              <span className="font-bold text-base">{x}</span>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* 完整能量排盘对比表 */}
        <div>
          <p className="text-sm font-medium mb-3">基于该笔画数，名字能量排盘如下：</p>
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]">能量点</TableHead>
                  {finalAnalysis.map((fa, i) => (
                    <React.Fragment key={fa.x}>
                      <TableHead colSpan={4} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                        名字数 {fa.x}
                      </TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
                <TableRow>
                  <TableHead />
                  {finalAnalysis.map((_, i) => (
                    <React.Fragment key={i}>
                      <TableHead className={`${COL_TEXT[i]} w-[52px]`}>干支</TableHead>
                      <TableHead className={`${COL_TEXT[i]} w-[56px]`}>地支吉凶</TableHead>
                      <TableHead className={`${COL_TEXT[i]} w-[50px]`}>九星</TableHead>
                      <TableHead className={`${COL_TEXT[i]} w-[56px]`}>九星吉凶</TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {FINAL_DISPLAY_KEYS.map((key) => {
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key === "配偶" ? "配偶" : key}</TableCell>
                      {finalAnalysis.map(({ energyAnalysis }, i) => {
                        const pt = energyAnalysis.points.find((p) => p.key === key);
                        return (
                          <React.Fragment key={i}>
                            <TableCell className={`font-mono ${COL_BG[i]}`}>
                              {pt?.tianGan && pt?.diZhi ? `${pt.tianGan}${pt.diZhi}` : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className={COL_BG[i]}>
                              <FBadge value={pt?.diZhiFortune ?? null} />
                            </TableCell>
                            <TableCell className={COL_BG[i]}>
                              {pt?.nineStar ?? <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className={COL_BG[i]}>
                              <FBadge value={pt?.nineStarFortune ?? null} />
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                    </TableRow>
                  );
                })}
                {/* 汇总行 */}
                <TableRow className="bg-muted/30">
                  <TableCell className="text-muted-foreground font-medium">汇总</TableCell>
                  {finalAnalysis.map(({ energyAnalysis }, i) => {
                    const pts = FINAL_DISPLAY_KEYS.map((k) => energyAnalysis.points.find((p) => p.key === k)).filter(Boolean);
                    return (
                      <React.Fragment key={i}>
                        <TableCell className={COL_BG[i]} />
                        <TableCell className={COL_BG[i]}>
                          <FortuneStats counts={Object.fromEntries(
                            FORTUNE_ORDER.map((f) => [f, pts.filter((p) => p?.diZhiFortune === f).length]).filter(([, v]) => (v as number) > 0)
                          )} />
                        </TableCell>
                        <TableCell className={COL_BG[i]} />
                        <TableCell className={COL_BG[i]}>
                          <FortuneStats counts={Object.fromEntries(
                            FORTUNE_ORDER.map((f) => [f, pts.filter((p) => p?.nineStarFortune === f).length]).filter(([, v]) => (v as number) > 0)
                          )} />
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 梅花易数对比 */}
        <div>
          <p className="text-sm font-medium mb-3">对应的梅花易数吉凶如下：</p>
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">人生阶段</TableHead>
                {finalAnalysis.map((fa, i) => (
                  <TableHead key={fa.x} className={`text-center font-bold ${COL_LABEL[i]}`}>
                    X={fa.x}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageLabels.map((stage, si) => (
                <TableRow key={stage}>
                  <TableCell className="font-medium">{stage}</TableCell>
                  {finalAnalysis.map(({ x, plumBlossom }, i) => {
                    const s = plumBlossom.stages[si];
                    return (
                      <TableCell key={x} className={`${COL_BG[i]}`}>
                        <div className="flex flex-col gap-0.5">
                          <span>{s.hexagram.name}</span>
                          <FBadge value={s.fortune} />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">统计</TableCell>
                {finalAnalysis.map(({ x, plumBlossom }, i) => {
                  const fc: Partial<Record<string, number>> = {};
                  for (const s of plumBlossom.stages) fc[s.fortune] = (fc[s.fortune] ?? 0) + 1;
                  return (
                    <TableCell key={x} className={COL_BG[i]}>
                      <FortuneStats counts={fc} />
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 九星含义参考 */}
        <div className="p-3 bg-muted/40 rounded-lg">
          <p className="text-xs font-medium mb-2 text-muted-foreground">九星含义参考</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(NINE_STAR_MEANING).map(([name, meaning]) => (
              <div key={name} className="flex gap-1">
                <span className="font-medium min-w-[28px]">{name}</span>
                <span className="text-muted-foreground">{meaning.slice(0, 18)}…</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 主组件 ────────────────────────────────────────────────

export function NamingSuggestionResult({ data }: { data: NamingResult }) {
  return (
    <div className="space-y-6">
      <CandidateTable data={data} />
      <PlumTable data={data} />
      <RecommendationSection data={data} />
    </div>
  );
}
