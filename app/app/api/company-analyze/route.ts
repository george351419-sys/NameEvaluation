import { NextRequest, NextResponse } from "next/server";
import { streamInterpretation } from "@/lib/claude";
import { buildCompanyUserPrompt, COMPANY_SYSTEM_PROMPT } from "@/lib/promptsCompany";
import type { CompanyAnalysisResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as CompanyAnalysisResult;

    const provider = process.env.LLM_PROVIDER ?? "deepseek";
    const apiKey =
      provider === "minimax" ? process.env.MINIMAX_API_KEY : process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: `${provider.toUpperCase()}_API_KEY 未配置` },
        { status: 500 }
      );
    }

    const stream = await streamInterpretation(data, {
      systemPrompt: COMPANY_SYSTEM_PROMPT,
      userPrompt: buildCompanyUserPrompt(data),
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Company analyze API error:", error);
    return NextResponse.json({ error: "生成解读时发生错误" }, { status: 500 });
  }
}
