import type { EnergyAnalysis, EnergyFortune, NineStarName } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NINE_STAR_MEANING } from "@/lib/energyPoints";

const FORTUNE_COLOR: Record<string, string> = {
  大吉: "bg-green-200 text-green-900 border-green-300",
  吉: "bg-green-100 text-green-800",
  小吉: "bg-lime-100 text-lime-800",
  小凶: "bg-orange-100 text-orange-800",
  凶: "bg-red-100 text-red-800",
  大凶: "bg-red-200 text-red-900 border-red-300",
};

const FORTUNE_ORDER: EnergyFortune[] = ["大吉", "吉", "小吉", "小凶", "凶", "大凶"];

const NINE_STAR_ORDER: NineStarName[] = ["生气", "延年", "天医", "伏位", "祸害", "六煞", "五鬼", "绝命"];

const KEY_POINTS = new Set([
  "天格", "人格", "地格", "财格", "灵格", "总格",
  "配偶", "财帛宫", "事业宫", "机缘宫",
]);

function FBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge className={`text-xs px-1.5 py-0 ${FORTUNE_COLOR[value] ?? "bg-gray-100"}`}>
      {value}
    </Badge>
  );
}

function countValues<T extends string>(values: (T | null)[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of values) {
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

function FortuneStatsCell({ values }: { values: (string | null)[] }) {
  const counts = countValues(values);
  const entries = FORTUNE_ORDER.filter((k) => counts[k]);
  if (entries.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-0.5">
      {entries.map((k) => (
        <span key={k} className={`inline-flex items-center gap-0.5 text-[10px] px-1 py-0 rounded ${FORTUNE_COLOR[k] ?? "bg-gray-100"}`}>
          {k}<span className="font-bold">{counts[k]}</span>
        </span>
      ))}
    </div>
  );
}

function NineStarStatsCell({ values }: { values: (NineStarName | null)[] }) {
  const counts = countValues(values);
  const entries = NINE_STAR_ORDER.filter((k) => counts[k]);
  if (entries.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-0.5">
      {entries.map((k) => (
        <span key={k} className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0 rounded bg-muted text-muted-foreground">
          {k}<span className="font-bold text-foreground">{counts[k]}</span>
        </span>
      ))}
    </div>
  );
}

interface Props {
  data: EnergyAnalysis;
}

export function EnergyMatrixCard({ data }: Props) {
  const validPoints = data.points.filter((p) => p.value !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>三、能量点分析</CardTitle>
        <p className="text-sm text-muted-foreground">
          人格：{data.renGeDiZhi}（{data.renGeDiZhiWuXing}）·
          八卦数 {data.renGeBagua} ·
          基准用于各能量点生克比较
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">能量点</TableHead>
              <TableHead className="w-[60px]">天干地支</TableHead>
              <TableHead className="w-[60px]">地支吉凶</TableHead>
              <TableHead className="w-[100px]">地支关系</TableHead>
              <TableHead className="w-[70px]">九星</TableHead>
              <TableHead className="w-[56px]">九星吉凶</TableHead>
              <TableHead className="w-[70px]">九星五行吉凶</TableHead>
              <TableHead className="w-[120px]">含义</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.points.map((point) => {
              const isKey = KEY_POINTS.has(point.key);
              const isRenGe = point.key === "人格";
              return (
                <TableRow
                  key={point.key}
                  className={isRenGe ? "bg-amber-50" : ""}
                >
                  <TableCell className={isKey ? "font-bold" : "font-medium"}>
                    {point.label}
                  </TableCell>
                  <TableCell className={`font-mono${isKey ? " font-bold" : ""}`}>
                    {point.tianGan && point.diZhi
                      ? `${point.tianGan}${point.diZhi}`
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <FBadge value={point.diZhiFortune} />
                  </TableCell>
                  <TableCell className="text-[10px]">
                    {point.diZhiRelation && point.diZhiRelation !== "无"
                      ? point.diZhiRelation
                      : <span className="text-muted-foreground">无</span>}
                  </TableCell>
                  <TableCell>
                    {point.nineStar ? (
                      <div className={`flex flex-col gap-0.5${isKey ? " font-bold" : ""}`}>
                        <span>{point.nineStar}</span>
                        <span className="text-muted-foreground text-[9px] font-normal">
                          {point.nineStarWuXing}
                        </span>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <FBadge value={point.nineStarSelfFortune} />
                  </TableCell>
                  <TableCell>
                    <FBadge value={point.nineStarFortune} />
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground leading-tight">
                    {point.meaning}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* 统计行 */}
            <TableRow className="bg-muted/30">
              <TableCell className="text-xs text-muted-foreground font-medium">汇总</TableCell>
              <TableCell />
              <TableCell>
                <FortuneStatsCell values={validPoints.map((p) => p.diZhiFortune)} />
              </TableCell>
              <TableCell />
              <TableCell>
                <NineStarStatsCell values={validPoints.map((p) => p.nineStar)} />
              </TableCell>
              <TableCell>
                <FortuneStatsCell values={validPoints.map((p) => p.nineStarSelfFortune)} />
              </TableCell>
              <TableCell>
                <FortuneStatsCell values={validPoints.map((p) => p.nineStarFortune)} />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>

        {/* 九星含义说明 */}
        <div className="mt-4 p-3 bg-muted/40 rounded-lg">
          <p className="text-xs font-medium mb-2 text-muted-foreground">九星含义</p>
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
