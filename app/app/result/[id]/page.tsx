import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { analyze } from "@/lib/analyze";
import { StrokeAnalysisCard } from "@/components/name/StrokeAnalysis";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { EnergyMatrixCard } from "@/components/name/EnergyMatrix";
import { AIInterpretation } from "@/components/name/AIInterpretation";
import { ComparePickerButton } from "@/components/name/ComparePickerButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const evaluation = await prisma.evaluation.findUnique({ where: { id } });

  if (!evaluation) notFound();

  // 每次加载都用最新算法重新计算，不读旧的 resultJson
  const result = analyze({
    surname: evaluation.surname,
    givenName: evaluation.givenName,
    birthDate: evaluation.birthDate,
    isLunar: evaluation.isLunar,
    fatherSurname: evaluation.fatherSurname ?? undefined,
    fatherZodiac: evaluation.fatherZodiac ?? undefined,
    motherSurname: evaluation.motherSurname ?? undefined,
    motherZodiac: evaluation.motherZodiac ?? undefined,
    childZodiac: evaluation.childZodiac ?? undefined,
  });

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
          <div className="flex gap-2">
            <Link href="/history" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ComparePickerButton currentId={id} />
            <Link href={`/?edit=${id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              编辑重算
            </Link>
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
        <AIInterpretation analysisResult={result} evaluationId={id} />
      </main>
    </div>
  );
}
