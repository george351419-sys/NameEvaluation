import React from "react";
import type { AnalysisResult, EnergyFortune } from "@/types";
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

// A=琥珀, B=蓝, C=紫
const COL_TEXT  = ["text-amber-800",  "text-blue-800",  "text-violet-800"];
const COL_BG    = ["bg-amber-50",     "bg-blue-50",     "bg-violet-50"];
const COL_LABEL = ["bg-amber-100 text-amber-900", "bg-blue-100 text-blue-900", "bg-violet-100 text-violet-900"];

const KEY_ENERGY_POINTS = [
  "天格", "人格", "地格", "财格", "灵格", "总格",
  "配偶", "财帛宫", "事业宫", "机缘宫",
];

function FBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge className={`text-xs px-1.5 py-0 ${FORTUNE_COLOR[value] ?? "bg-gray-100"}`}>
      {value}
    </Badge>
  );
}

function fortuneBg(value: string | null) {
  if (!value) return "";
  if (value === "大吉" || value === "吉") return "bg-green-50";
  if (value === "小吉" || value === "半吉") return "bg-lime-50";
  if (value === "小凶" || value === "半凶") return "bg-orange-50";
  if (value === "凶" || value === "大凶") return "bg-red-50";
  return "";
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

export interface CompareViewProps {
  labelA: string; birthA: string; resultA: AnalysisResult; idA?: string;
  labelB: string; birthB: string; resultB: AnalysisResult; idB?: string;
  labelC?: string; birthC?: string; resultC?: AnalysisResult; idC?: string;
}

export function CompareView({ labelA, birthA, resultA, labelB, birthB, resultB, labelC, birthC, resultC }: CompareViewProps) {
  const names = [
    { label: labelA, birth: birthA, result: resultA },
    { label: labelB, birth: birthB, result: resultB },
    ...(labelC && resultC ? [{ label: labelC, birth: birthC ?? "", result: resultC }] : []),
  ];

  // Stroke data per name per part
  const STROKE_PARTS = [
    { key: "surname" as const, label: "姓" },
    { key: "nameFirst" as const, label: "名" },
    { key: "nameLast" as const, label: "字" },
  ];

  // Energy key points per name
  const keyPts = names.map(({ result }) =>
    KEY_ENERGY_POINTS.map((key) => result.energyAnalysis.points.find((p) => p.key === key) ?? null)
  );

  return (
    <div className="space-y-6">
      {/* Name header cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${names.length}, 1fr)` }}>
        {names.map(({ label, birth }, i) => (
          <div key={i} className={`rounded-lg border py-3 px-4 text-center ${COL_BG[i]}`}>
            <p className={`text-lg font-bold ${COL_TEXT[i]}`}>{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{birth}</p>
          </div>
        ))}
      </div>

      {/* ── 一、笔画数 ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">一、笔画数对比</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              {/* 名字标题行 */}
              <TableRow>
                <TableHead className="w-[40px]" />
                {names.map(({ label }, i) => (
                  <TableHead key={i} colSpan={3} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              {/* 列标题行 */}
              <TableRow>
                <TableHead>项</TableHead>
                {names.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={`${COL_TEXT[i]} w-[60px]`}>字</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[40px]`}>画数</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {STROKE_PARTS.map(({ key, label }) => {
                const allEmpty = names.every(({ result }) => !result.strokeAnalysis.results[key].char);
                if (allEmpty) return null;
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    {names.map(({ result }, i) => {
                      const r = result.strokeAnalysis.results[key];
                      return (
                        <React.Fragment key={i}>
                          <TableCell className={`font-bold text-base ${COL_BG[i]}`}>
                            {r.char || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className={COL_BG[i]}>{r.char ? r.strokes : "—"}</TableCell>
                          <TableCell className={COL_BG[i]}>
                            {r.char ? <FBadge value={r.fortune} /> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                  </TableRow>
                );
              })}
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
              {/* 名字标题行 */}
              <TableRow>
                <TableHead className="w-[50px]" />
                {names.map(({ label }, i) => (
                  <TableHead key={i} colSpan={2} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              {/* 列标题行 */}
              <TableRow>
                <TableHead>阶段</TableHead>
                {names.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={COL_TEXT[i]}>卦名</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {names[0].result.plumBlossom.stages.map((s, si) => (
                <TableRow key={s.stage}>
                  <TableCell className="font-medium">{s.stage}</TableCell>
                  {names.map(({ result }, i) => {
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

      {/* ── 三、能量点 ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">三、能量点对比（重点项）</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              {/* 名字标题行 */}
              <TableRow>
                <TableHead className="w-[60px]" />
                {names.map(({ label }, i) => (
                  <TableHead key={i} colSpan={4} className={`text-center font-bold border-b ${COL_LABEL[i]}`}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
              {/* 列标题行 */}
              <TableRow>
                <TableHead>能量点</TableHead>
                {names.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={`${COL_TEXT[i]} w-[52px]`}>干支</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[50px]`}>地支吉凶</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[46px]`}>九星</TableHead>
                    <TableHead className={`${COL_TEXT[i]} w-[56px]`}>九星吉凶</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {KEY_ENERGY_POINTS.map((key, ki) => (
                <TableRow key={key}>
                  <TableCell className="font-bold">{key}</TableCell>
                  {names.map((_, i) => {
                    const pt = keyPts[i][ki];
                    return (
                      <React.Fragment key={i}>
                        <TableCell className={`font-mono ${COL_BG[i]}`}>
                          {pt?.tianGan && pt?.diZhi ? `${pt.tianGan}${pt.diZhi}` : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className={COL_BG[i]}>
                          <FBadge value={pt?.diZhiFortune ?? null} />
                        </TableCell>
                        <TableCell className={COL_BG[i]}>{pt?.nineStar ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className={COL_BG[i]}>
                          <FBadge value={pt?.nineStarFortune ?? null} />
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}

              {/* 汇总行 */}
              <TableRow className="bg-muted/30">
                <TableCell className="text-muted-foreground text-xs font-medium">汇总</TableCell>
                {names.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableCell className={COL_BG[i]} />
                    <TableCell className={COL_BG[i]}>
                      <FortuneStats values={keyPts[i].map((p) => p?.diZhiFortune ?? null)} />
                    </TableCell>
                    <TableCell className={COL_BG[i]} />
                    <TableCell className={COL_BG[i]}>
                      <FortuneStats values={keyPts[i].map((p) => p?.nineStarFortune ?? null)} />
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
