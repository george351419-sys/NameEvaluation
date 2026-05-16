import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";
import type { NameInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as NameInput;
    if (!input.surname || !input.givenName || (!input.birthDate && !input.zodiacOverride)) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    const result = analyze(input);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json({ error: "计算失败" }, { status: 500 });
  }
}
