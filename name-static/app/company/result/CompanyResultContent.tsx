"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { getCompanyEvaluation } from "@/lib/storage";
import type { StoredCompanyEvaluation } from "@/lib/storage";
import { CompanyStrokeAnalysisCard } from "@/components/name/CompanyStrokeAnalysisCard";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { CompanyEnergyMatrixCard } from "@/components/name/CompanyEnergyMatrixCard";
import { ShareButton } from "@/components/name/ShareButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCompanyRuleText } from "@/lib/ruleText";
import type { CompanyAnalysisResult } from "@/types";

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export default function CompanyResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [evaluation, setEvaluation] = useState<StoredCompanyEvaluation | null>(null);
  const [result, setResult] = useState<CompanyAnalysisResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const ev = getCompanyEvaluation(id);
    if (!ev) { setNotFound(true); return; }
    setEvaluation(ev);
    setResult(analyzeCompany({
      companyName: ev.companyName,
      founderName: ev.founderName,
      partnerNames: ev.partnerNames,
    }));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/company" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result || !evaluation) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  const ruleText = generateCompanyRuleText(result);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                {evaluation.companyName} 公司名评测报告
              </h1>
              <p className="text-xs text-muted-foreground">创始人：{evaluation.founderName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/history?tab=company" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ShareButton name={evaluation.companyName} />
            <Link href="/company" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新评测
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <CompanyStrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} />
        <CompanyEnergyMatrixCard data={result.energyAnalysis} />
        <Card>
          <CardHeader>
            <CardTitle>四、命理综合解析</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(ruleText) }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
