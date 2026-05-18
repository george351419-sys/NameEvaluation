"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyze } from "@/lib/analyze";
import { getEvaluation } from "@/lib/storage";
import type { StoredEvaluation } from "@/lib/storage";
import { StrokeAnalysisCard } from "@/components/name/StrokeAnalysis";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { EnergyMatrixCard } from "@/components/name/EnergyMatrix";
import { AIInterpretation } from "@/components/name/AIInterpretation";
import { ComparePickerButton } from "@/components/name/ComparePickerButton";
import { ShareButton } from "@/components/name/ShareButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

export default function ResultPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [evaluation, setEvaluation] = useState<StoredEvaluation | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const ev = getEvaluation(id);
    if (!ev) { setNotFound(true); return; }
    setEvaluation(ev);
    setResult(analyze({
      surname: ev.surname,
      givenName: ev.givenName,
      birthDate: ev.birthDate,
      isLunar: ev.isLunar,
      zodiacOverride: ev.zodiacOverride,
      fatherSurname: ev.fatherSurname,
      fatherZodiac: ev.fatherZodiac,
      motherSurname: ev.motherSurname,
      motherZodiac: ev.motherZodiac,
      childZodiac: ev.childZodiac,
    }));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result || !evaluation) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                {evaluation.surname}{evaluation.givenName} 命理评测报告
              </h1>
              <p className="text-xs text-muted-foreground">
                出生：{evaluation.birthDate}{evaluation.isLunar ? "（农历）" : "（阳历）"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ShareButton name={`${evaluation.surname}${evaluation.givenName}`} />
            <ComparePickerButton currentId={id} />
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新评测
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <StrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} />
        <EnergyMatrixCard data={result.energyAnalysis} />
        <AIInterpretation analysisResult={result} />
      </main>
    </div>
  );
}
