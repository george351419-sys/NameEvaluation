import type { StrokeAnalysis as StrokeAnalysisType } from "@/types";
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

const FORTUNE_COLOR: Record<string, string> = {
  大吉: "bg-[#fef3e2] text-[#9a6820] border border-[rgba(196,149,74,0.3)]",
  吉:   "bg-[#edf7f0] text-[#2d7a4f] border border-[rgba(45,122,79,0.2)]",
  小吉: "bg-[#e8f4fd] text-[#2a6496] border border-[rgba(42,100,150,0.2)]",
  半吉: "bg-[#f5f5f0] text-[#7a7a6a] border border-[rgba(122,122,106,0.2)]",
  半凶: "bg-[#fff8e6] text-[#c47c00] border border-[rgba(196,124,0,0.2)]",
  凶:   "bg-[#fef0f0] text-[#a04040] border border-[rgba(160,64,64,0.2)]",
  大凶: "bg-[#f5e6e6] text-[#7a1a1a] border border-[rgba(122,26,26,0.2)]",
};

interface Props {
  data: StrokeAnalysisType;
}

export function StrokeAnalysisCard({ data }: Props) {
  const rows = [
    { label: "姓", result: data.results.surname },
    { label: "名", result: data.results.nameFirst },
    // 仅在有"字"时（双字以上名字）显示该行
    ...(data.results.nameLast.char
      ? [{ label: "字", result: data.results.nameLast }]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>一、笔画数吉凶</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目</TableHead>
              <TableHead>名字拆解</TableHead>
              <TableHead>笔画数</TableHead>
              <TableHead>81吉凶</TableHead>
              <TableHead>断语</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ label, result }) => (
              <TableRow key={label}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell className="text-lg font-bold">{result.char}</TableCell>
                <TableCell>{result.strokes}</TableCell>
                <TableCell>
                  <Badge className={FORTUNE_COLOR[result.fortune] || ""}>
                    {result.fortune}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {result.meaning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
