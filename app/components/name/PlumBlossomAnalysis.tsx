import type { PlumBlossomAnalysis as PlumBlossomType } from "@/types";
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
import { HexagramCard } from "./HexagramDisplay";

const FORTUNE_COLOR: Record<string, string> = {
  大吉: "bg-green-200 text-green-900",
  吉: "bg-green-100 text-green-800",
  小吉: "bg-lime-100 text-lime-800",
  凶: "bg-red-100 text-red-800",
  大凶: "bg-red-200 text-red-900",
};

interface Props {
  data: PlumBlossomType;
}

export function PlumBlossomCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>二、梅花易数</CardTitle>
        <p className="text-sm text-muted-foreground">
          生肖：{data.zodiac} · 动爻：第 {data.movingYao} 爻 · 上卦：{data.upperGua} · 下卦：{data.lowerGua}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 三卦图示 */}
        <div className="flex justify-around border rounded-lg p-4 bg-muted/30">
          {data.stages.map((stage) => (
            <HexagramCard
              key={stage.stage}
              label={`${stage.stage}（${stage.type}）`}
              hexagram={stage.hexagram}
              isGood={["大吉", "吉", "小吉"].includes(stage.fortune)}
            />
          ))}
        </div>

        {/* 详细表格 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>人生阶段</TableHead>
              <TableHead>梅花阶段</TableHead>
              <TableHead>梅花卦</TableHead>
              <TableHead>体用区分</TableHead>
              <TableHead>体用关系</TableHead>
              <TableHead>吉凶</TableHead>
              <TableHead>解读</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.stages.map((stage) => (
              <TableRow key={stage.stage}>
                <TableCell className="font-medium">{stage.stage}</TableCell>
                <TableCell>{stage.type}</TableCell>
                <TableCell className="font-medium">{stage.hexagram.name}</TableCell>
                <TableCell className="text-sm">
                  {stage.body === stage.hexagram.upper ? (
                    // 体在上卦 → 体上用下
                    <>
                      体：{stage.body}（{stage.bodyWuxing}）<br />
                      用：{stage.use}（{stage.useWuxing}）
                    </>
                  ) : (
                    // 体在下卦 → 用上体下
                    <>
                      用：{stage.use}（{stage.useWuxing}）<br />
                      体：{stage.body}（{stage.bodyWuxing}）
                    </>
                  )}
                </TableCell>
                <TableCell>{stage.relation}</TableCell>
                <TableCell>
                  <Badge className={FORTUNE_COLOR[stage.fortune] || ""}>
                    {stage.fortune}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px]">
                  {stage.interpretation}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
