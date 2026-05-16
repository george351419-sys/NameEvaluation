import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { analyze } from "@/lib/analyze";
import { CompareView } from "@/components/name/CompareView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string }>;
}

function toInput(ev: {
  surname: string; givenName: string; birthDate: string; isLunar: boolean;
  fatherSurname: string | null; fatherZodiac: string | null;
  motherSurname: string | null; motherZodiac: string | null; childZodiac: string | null;
}) {
  return {
    surname: ev.surname,
    givenName: ev.givenName,
    birthDate: ev.birthDate,
    isLunar: ev.isLunar,
    fatherSurname: ev.fatherSurname ?? undefined,
    fatherZodiac: ev.fatherZodiac ?? undefined,
    motherSurname: ev.motherSurname ?? undefined,
    motherZodiac: ev.motherZodiac ?? undefined,
    childZodiac: ev.childZodiac ?? undefined,
  };
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b, c } = await searchParams;
  if (!a || !b) notFound();

  const ids = [a, b, ...(c ? [c] : [])];
  const evs = await Promise.all(ids.map((id) => prisma.evaluation.findUnique({ where: { id } })));
  if (evs.some((ev) => !ev)) notFound();

  const [evA, evB, evC] = evs as NonNullable<(typeof evs)[number]>[];
  const results: AnalysisResult[] = evs.map((ev) => analyze(toInput(ev!)));
  const [resultA, resultB, resultC] = results;

  const label = (ev: typeof evA) => `${ev.surname}${ev.givenName}`;
  const birth = (ev: typeof evA) => `${ev.birthDate}${ev.isLunar ? "（农历）" : "（阳历）"}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">☯</span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-amber-900 truncate">
                {[evA, evB, evC].filter(Boolean).map(label).join(" vs ")} — 命理对比
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {[evA, evB, evC].filter(Boolean).map(birth).join(" / ")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4 shrink-0 flex-wrap justify-end">
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            {[evA, evB, evC].filter(Boolean).map((ev, i) => (
              <Link
                key={ids[i]}
                href={`/result/${ids[i]}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {label(ev)} 报告
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <CompareView
          labelA={label(evA)} birthA={birth(evA)} resultA={resultA} idA={a}
          labelB={label(evB)} birthB={birth(evB)} resultB={resultB} idB={b}
          {...(evC && resultC ? {
            labelC: label(evC), birthC: birth(evC), resultC, idC: c,
          } : {})}
        />
      </main>
    </div>
  );
}
