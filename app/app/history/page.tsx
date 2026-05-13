import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryMultiSelect } from "@/components/name/HistoryMultiSelect";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const evaluations = await prisma.evaluation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      surname: true,
      givenName: true,
      birthDate: true,
      isLunar: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">历史评测记录</h1>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            新评测
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <HistoryMultiSelect evaluations={evaluations} />
      </main>
    </div>
  );
}
