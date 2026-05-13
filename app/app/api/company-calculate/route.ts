import { NextRequest, NextResponse } from "next/server";
import { analyzeCompany } from "@/lib/analyzeCompany";
import type { CompanyInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CompanyInput;
    if (!input.companyName || !input.founderName) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    const result = analyzeCompany(input);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Company calculate error:", error);
    return NextResponse.json({ error: "计算失败" }, { status: 500 });
  }
}
