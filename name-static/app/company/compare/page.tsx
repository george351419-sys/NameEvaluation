"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyEvaluation } from "@/lib/storage";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { CompanyCompareView } from "@/components/name/CompanyCompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyAnalysisResult } from "@/types";

function CompanyCompareContent() {
  const searchParams = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";
  const c = searchParams.get("c") ?? "";
  const [results, setResults] = useState<CompanyAnalysisResult[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!a || !b) { setMissing(true); return; }
    const ids = [a, b, ...(c ? [c] : [])];
    const evs = ids.map((id) => getCompanyEvaluation(id));
    if (evs.some((ev) => !ev)) { setMissing(true); return; }
    setResults(evs.map((ev) => analyzeCompany({
      companyName: ev!.companyName,
      founderName: ev!.founderName,
      partnerNames: ev!.partnerNames,
    })));
  }, [a, b, c]);

  if (missing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>找不到对比记录</p>
        <Link href="/history?tab=company" className={cn(buttonVariants())}>返回历史记录</Link>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf5] to-[#efe8d8]">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-[#3d2b10]">公司名对比</h1>
          </div>
          <Link href="/history?tab=company" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            ← 返回历史
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <CompanyCompareView
          labelA={a}
          resultA={results[0]}
          labelB={b}
          resultB={results[1]}
          labelC={c || undefined}
          resultC={results[2]}
        />
      </main>
    </div>
  );
}

export default function CompanyComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompanyCompareContent />
    </Suspense>
  );
}
