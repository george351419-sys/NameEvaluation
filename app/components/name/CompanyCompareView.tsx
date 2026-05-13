import React from "react";
import type { CompanyAnalysisResult, EnergyFortune } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FORTUNE_COLOR: Record<string, string> = {
  大吉: "bg-green-200 text-green-900 border-green-300",
  吉: "bg-green-100 text-green-800",
  小吉: "bg-lime-100 text-lime-800",
  小凶: "bg-orange-100 text-orange-800",
  凶: "bg-red-100 text-red-800",
  大凶: "bg-red-200 text-red-900 border-red-300",
  半吉: "bg-yellow-100 text-yellow-800",
  半凶: "bg-orange-100 text-orange-800",
};
const FORTUNE_ORDER: EnergyFortune[] = ["大吉", "吉", "小吉", "小凶", "凶", "大凶"];
const ALL_FORTUNE_ORDER = ["大吉", "吉", "半吉", "小吉", "小凶", "半凶", "凶", "大凶"];

const COL_TEXT  = ["text-amber-800",  "text-blue-800",  "text-violet-800"];
const COL_BG    = ["bg-amber-50",     "bg-blue-50",     "bg-violet-50"];
const COL_LABEL = ["bg-amber-100 text-amber-900", "bg-blue-100 text-blue-900", "bg-violet-100 text-violet-900"];

function FBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge className={`text-xs px-1.5 py-0 ${FORTUNE_COLOR[value] ?? "bg-gray-100"}`}>
      {value}
    </Badge>
  );
}

function FortuneStats({ values }: { values: (string | null)[] }) {
  const counts: Record<string, number> = {};
  for (const v of values) {
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  }
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

// 笔画吉凶统计（大吉/吉/半吉/凶/大凶 等各几个）
function StrokeFortuneStats({ fortunes }: { fortunes: string[] }) {
  const counts: Record<string, number> = {};
  for (const v of fortunes) counts[v] = (counts[v] ?? 0) + 1;
  const entries = ALL_FORTUNE_ORDER.filter((k) => counts[k]);
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

export interface CompanyCompareViewProps {
  labelA: string; resultA: CompanyAnalysisResult;
  labelB: string; resultB: CompanyAnalysisResult;
  labelC?: string; resultC?: CompanyAnalysisResult;
}

export function CompanyCompareView({ labelA, resultA, labelB, resultB, labelC, resultC }: CompanyCompareViewProps) {
  const entries = [
    { label: labelA, result: resultA },
    { label: labelB, result: resultB },
    ...(labelC && resultC ? [{ label: labelC, result: resultC }] : []),
  ];

  // 所有公司的能量点 key 并集（保持顺序：按第一家公司的顺序，再补充其他公司独有的）
  const allKeys = Array.from(
    new Set(entries.flatMap(({ result }) => result.energyAnalysis.points.map((p) => p.key)))
  );

  const pointsByKey = allKeys.map((key) => ({
    key,
    label: entries.flatMap(({ result }) => result.energyAnalysis.points).find((p) => p.key === key)?.label ?? key,
    points: entries.map(({ result }) => result.energyAnalysis.points.find((p) => p.key === key) ?? null),
  }));

  const maxChars = Math.max(...entries.map((e) => e.result.strokeAnalysis.chars.length));

  return (
    <div className="space-y-6">
      {/* 公司名片 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${entries.length}, 1fr)` }}>
        {entries.map(({ label, result }, i) => (
          <div key={i} className={`rounded-lg border py-3 px-4 text-center ${COL_BG[i]}`}>
            <p className={`text-lg font-bold ${COL_TEXT[i]}`}>{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              创始人：{result.input.founderName}
              {result.input.partnerNames.length > 0 && `　合伙人：${result.input.partnerNames.join("、")}`}
            </p>
          </div>
        ))}
      </div>

      {/* ── 一、笔画数 ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">一、笔画数对比</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                {entries.map(({ label }, i) => (
                  <TableHead key={i} colSpan={3} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead>序</TableHead>
                {entries.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>字</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[40px]`}>画数</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: maxChars }).map((_, ci) => (
                <TableRow key={ci}>
                  <TableCell className="text-muted-foreground">{ci + 1}</TableCell>
                  {entries.map(({ result }, i) => {
                    const c = result.strokeAnalysis.chars[ci];
                    return (
                      <React.Fragment key={i}>
                        <TableCell className={`font-bold text-base ${COL_BG[i]}`}>
                          {c?.char ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className={COL_BG[i]}>{c ? c.strokes : "—"}</TableCell>
                        <TableCell className={COL_BG[i]}>
                          {c ? <FBadge value={c.fortune} /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}

              {/* 吉凶统计行 */}
              <TableRow className="bg-muted/20 font-medium">
                <TableCell className="text-muted-foreground text-xs">汇总</TableCell>
                {entries.map(({ result }, i) => (
                  <React.Fragment key={i}>
                    <TableCell className={COL_BG[i]} colSpan={2} />
                    <TableCell className={COL_BG[i]}>
                      <StrokeFortuneStats fortunes={result.strokeAnalysis.chars.map((c) => c.fortune)} />
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 二、梅花易数 ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">二、梅花易数对比</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]" />
                {entries.map(({ label }, i) => (
                  <TableHead key={i} colSpan={2} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead>阶段</TableHead>
                {entries.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={COL_TEXT[i]}>卦名</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries[0].result.plumBlossom.stages.map((s, si) => (
                <TableRow key={s.stage}>
                  <TableCell className="font-medium">{s.stage}</TableCell>
                  {entries.map(({ result }, i) => {
                    const stage = result.plumBlossom.stages[si];
                    return (
                      <React.Fragment key={i}>
                        <TableCell className={COL_BG[i]}>{stage?.hexagram.name ?? "—"}</TableCell>
                        <TableCell className={COL_BG[i]}>
                          <FBadge value={stage?.fortune ?? null} />
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 三、能量点（全部） ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">三、能量点对比（全部）</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]" />
                {entries.map(({ label }, i) => (
                  <TableHead key={i} colSpan={4} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead>字段</TableHead>
                {entries.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={`${COL_TEXT[i]} w-[52px]`}>干支</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[56px]`}>地支吉凶</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[46px]`}>九星</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[56px]`}>九星吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointsByKey.map(({ key, label, points }) => (
                <TableRow key={key}>
                  <TableCell className="font-medium text-[11px] leading-tight">{label}</TableCell>
                  {points.map((pt, i) => (
                    <React.Fragment key={i}>
                      <TableCell className={`font-mono ${COL_BG[i]}`}>
                        {pt ? `${pt.tianGan}${pt.diZhi}` : <span className="text-muted-foreground">—</span>}
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
                  ))}
                </TableRow>
              ))}

              {/* 汇总 */}
              <TableRow className="bg-muted/30">
                <TableCell className="text-muted-foreground text-xs font-medium">汇总</TableCell>
                {entries.map(({ result }, i) => (
                  <React.Fragment key={i}>
                    <TableCell className={COL_BG[i]} />
                    <TableCell className={COL_BG[i]}>
                      <FortuneStats values={result.energyAnalysis.points.map((p) => p.diZhiFortune)} />
                    </TableCell>
                    <TableCell className={COL_BG[i]} />
                    <TableCell className={COL_BG[i]}>
                      <FortuneStats values={result.energyAnalysis.points.map((p) => p.nineStarFortune)} />
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
