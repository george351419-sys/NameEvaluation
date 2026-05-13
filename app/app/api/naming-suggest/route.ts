import { NextRequest, NextResponse } from "next/server";
import { suggestNaming } from "@/lib/namingSuggestion";
import type { NamingInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as NamingInput;
    if (!input.surname || !input.ownZodiac || !input.fatherSurname || !input.motherSurname || !input.motherZodiac) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    const result = suggestNaming(input);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Naming suggest error:", error);
    return NextResponse.json({ error: "计算失败" }, { status: 500 });
  }
}
