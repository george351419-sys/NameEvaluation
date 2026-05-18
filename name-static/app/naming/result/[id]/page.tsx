import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NamingSuggestionResult } from "@/components/name/NamingSuggestionResult";
import type { NamingResult } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NamingResultPage({ params }: Props) {
  const { id } = await params;
  const record = await prisma.namingEvaluation.findUnique({ where: { id } });
  if (!record) notFound();

  const result: NamingResult = JSON.parse(record.resultJson);

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
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-medium">姓：</span>{record.surname}
          <span className="mx-3 text-amber-400">·</span>
          <span className="font-medium">属相：</span>{record.ownZodiac}
          <span className="mx-3 text-amber-400">·</span>
          <span className="font-medium">父亲姓：</span>{record.fatherSurname}
          {record.fatherZodiac && (
            <>
              <span className="mx-3 text-amber-400">·</span>
              <span className="font-medium">父亲属相：</span>{record.fatherZodiac}
            </>
          )}
          <span className="mx-3 text-amber-400">·</span>
          <span className="font-medium">母亲姓：</span>{record.motherSurname}
          <span className="mx-3 text-amber-400">·</span>
          <span className="font-medium">母亲属相：</span>{record.motherZodiac}
        </div>
        <NamingSuggestionResult data={result} />
      </main>
    </div>
  );
}
