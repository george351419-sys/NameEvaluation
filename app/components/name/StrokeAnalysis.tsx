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
  吉: "bg-green-100 text-green-800",
  大吉: "bg-green-200 text-green-900",
  半吉: "bg-yellow-100 text-yellow-800",
  凶: "bg-red-100 text-red-800",
  大凶: "bg-red-200 text-red-900",
  半凶: "bg-orange-100 text-orange-800",
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
