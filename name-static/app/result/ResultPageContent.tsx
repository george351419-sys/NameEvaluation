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
import { calcScore, fortuneBadgeClass } from "@/lib/scoreUtils";

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
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf5] to-[#efe8d8]">
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
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))} style={{ background: "linear-gradient(135deg, #8b653a, #c4954a)" }}>
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
        {(() => {
          const { score, label } = calcScore(result);
          return (
            <div className="rounded-2xl p-5 text-white flex items-center justify-between shadow-lg relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #8b653a 0%, #b07a3a 50%, #c4954a 100%)" }}>
              <div className="absolute right-[-24px] top-[-24px] w-28 h-28 rounded-full bg-white/[0.07]" />
              <div>
                <div className="text-xs opacity-70 tracking-[0.2em] mb-1">综合评分</div>
                <div className="text-5xl font-black leading-none">{score}</div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1 text-sm font-semibold mb-2">
                  ✦ {label}
                </div>
                <div className="text-xs opacity-60 block">
                  {evaluation.zodiacOverride || ""}
                </div>
                <div className="text-xs opacity-50 mt-1">笔画 · 梅花 · 干支 三维评测</div>
              </div>
            </div>
          );
        })()}
        <StrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} />
        <EnergyMatrixCard data={result.energyAnalysis} />
        <AIInterpretation analysisResult={result} />
      </main>
    </div>
  );
}
