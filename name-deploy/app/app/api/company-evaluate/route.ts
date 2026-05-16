import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { CompanyAnalysisResult } from "@/types";

export async function GET() {
  try {
    const evaluations = await prisma.companyEvaluation.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, companyName: true, founderName: true, createdAt: true },
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("GET company evaluations error:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { result: CompanyAnalysisResult };
    const { result } = body;
    const { input } = result;

    const evaluation = await prisma.companyEvaluation.create({
      data: {
        companyName: input.companyName,
        founderName: input.founderName,
        founderZodiac: null,
        partnerNames: JSON.stringify(input.partnerNames),
        resultJson: JSON.stringify(result),
      },
    });

    return NextResponse.json({ id: evaluation.id });
  } catch (error) {
    console.error("POST company evaluation error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
