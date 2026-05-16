import type { CompanyStrokeAnalysis, StrokeResult } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
  data: CompanyStrokeAnalysis;
}

export function CompanyStrokeAnalysisCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>一、笔画数吉凶</CardTitle>
        <p className="text-sm text-muted-foreground">
          公司名字总笔画数：{data.totalStrokes}
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>序号</TableHead>
              <TableHead>字</TableHead>
              <TableHead>笔画数</TableHead>
              <TableHead>81吉凶</TableHead>
              <TableHead>断语</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.chars.map((result: StrokeResult, i: number) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                <TableCell className="text-lg font-bold">{result.char}</TableCell>
                <TableCell>{result.strokes}</TableCell>
                <TableCell>
                  <Badge className={FORTUNE_COLOR[result.fortune] ?? ""}>
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
