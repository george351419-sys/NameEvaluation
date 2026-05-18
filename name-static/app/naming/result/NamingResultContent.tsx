"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getNamingEvaluation } from "@/lib/storage";
import { NamingSuggestionResult } from "@/components/name/NamingSuggestionResult";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NamingResult } from "@/types";

export default function NamingResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [result, setResult] = useState<NamingResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const record = getNamingEvaluation(id);
    if (!record) { setNotFound(true); return; }
    setResult(JSON.parse(record.resultJson) as NamingResult);
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>记录不存在或已被删除</p>
        <Link href="/naming" className={cn(buttonVariants())}>返回首页</Link>
      </div>
    );
  }

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">命名建议</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/history?tab=naming" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <Link href="/naming" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新分析
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <NamingSuggestionResult data={result} />
      </main>
    </div>
  );
}
