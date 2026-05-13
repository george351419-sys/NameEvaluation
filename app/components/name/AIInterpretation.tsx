"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types";

interface Props {
  analysisResult: AnalysisResult;
  evaluationId: string;
}

export function AIInterpretation({ analysisResult, evaluationId }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startStream = async () => {
    setLoading(true);
    setText("");
    setDone(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisResult),
      });

      if (!res.ok) {
        setText("AI 解读暂不可用，请检查 ANTHROPIC_API_KEY 配置。");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value, { stream: true });
        setText((prev) => prev + chunk);
      }

      // 保存解读到数据库
      await fetch(`/api/evaluation/${evaluationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interpretation: text }),
      }).catch(() => {});

      setDone(true);
    } catch {
      setText("生成解读时发生错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  // 自动开始解读
  useEffect(() => {
    if (!text && !loading) {
      startStream();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>四、AI 命理解读</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            由 Claude AI 基于三大模块排盘结果生成个性化解读
          </p>
        </div>
        {done && (
          <Button variant="outline" size="sm" onClick={startStream}>
            重新生成
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading && !text && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span>正在生成命理解读...</span>
          </div>
        )}
        {text && (
          <div
            ref={containerRef}
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
          />
        )}
        {loading && text && (
          <span className="inline-block h-4 w-0.5 bg-primary animate-pulse ml-0.5" />
        )}
      </CardContent>
    </Card>
  );
}

// 简单 markdown → html 转换（不引入额外依赖）
function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
