import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { CompanyCompareView } from "@/components/name/CompanyCompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyInput } from "@/types";

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string }>;
}

export default async function CompanyComparePage({ searchParams }: Props) {
  const { a, b, c } = await searchParams;
  if (!a || !b) notFound();

  const ids = [a, b, ...(c ? [c] : [])];
  const evs = await Promise.all(
    ids.map((id) => prisma.companyEvaluation.findUnique({ where: { id } }))
  );
  if (evs.some((ev) => !ev)) notFound();

  const results = evs.map((ev) => {
    const input: CompanyInput = {
      companyName: ev!.companyName,
      founderName: ev!.founderName,
      partnerNames: JSON.parse(ev!.partnerNames) as string[],
    };
    return { ev: ev!, result: analyzeCompany(input) };
  });

  const [ra, rb, rc] = results;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">☯</span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-amber-900 truncate">
                {results.map((r) => r.ev.companyName).join(" vs ")} — 公司命理对比
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {results.map((r) => `创始人：${r.ev.founderName}`).join(" / ")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4 shrink-0 flex-wrap justify-end">
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            {results.map((r, i) => (
              <Link
                key={ids[i]}
                href={`/company/result/${ids[i]}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {r.ev.companyName} 报告
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <CompanyCompareView
          labelA={ra.ev.companyName} resultA={ra.result}
          labelB={rb.ev.companyName} resultB={rb.result}
          {...(rc ? { labelC: rc.ev.companyName, resultC: rc.result } : {})}
        />
      </main>
    </div>
  );
}
