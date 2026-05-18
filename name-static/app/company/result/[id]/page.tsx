import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { analyzeCompany } from "@/lib/analyzeCompany";
import { CompanyStrokeAnalysisCard } from "@/components/name/CompanyStrokeAnalysisCard";
import { PlumBlossomCard } from "@/components/name/PlumBlossomAnalysis";
import { CompanyEnergyMatrixCard } from "@/components/name/CompanyEnergyMatrixCard";
import { AIInterpretation } from "@/components/name/AIInterpretation";
import { ShareButton } from "@/components/name/ShareButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyInput } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyResultPage({ params }: Props) {
  const { id } = await params;
  const ev = await prisma.companyEvaluation.findUnique({ where: { id } });
  if (!ev) notFound();

  const input: CompanyInput = {
    companyName: ev.companyName,
    founderName: ev.founderName,
    partnerNames: JSON.parse(ev.partnerNames) as string[],
  };

  const result = analyzeCompany(input);

  const modelName = process.env.LLM_PROVIDER === "minimax" ? "MiniMax" : "DeepSeek";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                {ev.companyName} 公司命理评测报告
              </h1>
              <p className="text-xs text-muted-foreground">
                创始人：{ev.founderName}
                {input.partnerNames.length > 0 && `，合伙人：${input.partnerNames.join("、")}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/history?tab=company" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              ← 返回记录
            </Link>
            <ShareButton name={ev.companyName} />
            <Link href="/company" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              新评测
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <CompanyStrokeAnalysisCard data={result.strokeAnalysis} />
        <PlumBlossomCard data={result.plumBlossom} isCompany />
        <CompanyEnergyMatrixCard data={result.energyAnalysis} />
        <AIInterpretation
          analysisResult={result}
          evaluationId={id}
          modelName={modelName}
          apiEndpoint="/api/company-analyze"
          saveEndpoint={`/api/company-evaluate/${id}`}
        />
      </main>
    </div>
  );
}
