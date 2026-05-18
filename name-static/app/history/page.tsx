import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryTabs } from "@/components/name/HistoryTabs";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function HistoryPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const [evaluations, companyEvaluations, namingEvaluations] = await Promise.all([
    prisma.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        surname: true,
        givenName: true,
        birthDate: true,
        isLunar: true,
        createdAt: true,
      },
    }),
    prisma.companyEvaluation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        founderName: true,
        createdAt: true,
      },
    }),
    prisma.namingEvaluation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        surname: true,
        ownZodiac: true,
        fatherSurname: true,
        fatherZodiac: true,
        motherSurname: true,
        motherZodiac: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">历史评测记录</h1>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-amber-700 hover:bg-amber-800 text-white")}>
            新评测
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <HistoryTabs
          personalEvaluations={evaluations}
          companyEvaluations={companyEvaluations}
          namingEvaluations={namingEvaluations}
          defaultTab={tab}
        />
      </main>
    </div>
  );
}
