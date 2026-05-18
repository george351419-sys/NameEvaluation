"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getEvaluation } from "@/lib/storage";
import { analyze } from "@/lib/analyze";
import { CompareView } from "@/components/name/CompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

function CompareContent() {
  const searchParams = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";
  const c = searchParams.get("c") ?? "";
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!a || !b) { setMissing(true); return; }
    const ids = [a, b, ...(c ? [c] : [])];
    const evs = ids.map((id) => getEvaluation(id));
    if (evs.some((ev) => !ev)) { setMissing(true); return; }
    setResults(evs.map((ev) => analyze({
      surname: ev!.surname,
      givenName: ev!.givenName,
      birthDate: ev!.birthDate,
      isLunar: ev!.isLunar,
      zodiacOverride: ev!.zodiacOverride,
      fatherSurname: ev!.fatherSurname,
      fatherZodiac: ev!.fatherZodiac,
      motherSurname: ev!.motherSurname,
      motherZodiac: ev!.motherZodiac,
      childZodiac: ev!.childZodiac,
    })));
  }, [a, b, c]);

  if (missing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>找不到对比记录</p>
        <Link href="/history" className={cn(buttonVariants())}>返回历史记录</Link>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">姓名对比</h1>
          </div>
          <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            ← 返回历史
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <CompareView results={results} />
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompareContent />
    </Suspense>
  );
}
