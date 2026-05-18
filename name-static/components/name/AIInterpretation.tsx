"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRuleText } from "@/lib/ruleText";
import type { AnalysisResult } from "@/types";

interface Props {
  analysisResult: AnalysisResult;
}

export function AIInterpretation({ analysisResult }: Props) {
  const text = useMemo(() => generateRuleText(analysisResult), [analysisResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>四、命理综合解析</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          基于三大模块排盘结果生成命理解读
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
        />
      </CardContent>
    </Card>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
