import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyze } from "@/lib/analyze";
import type { NameInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as NameInput;

    if (!input.surname || !input.givenName || !input.birthDate) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // 执行命理分析
    const result = analyze(input);

    // 自动保存到数据库
    const name = `${input.surname}${input.givenName}_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}`;

    const evaluation = await prisma.evaluation.create({
      data: {
        name,
        surname: input.surname,
        givenName: input.givenName,
        nameFirst: result.nameParts.nameFirst,
        nameLast: result.nameParts.nameLast,
        birthDate: input.birthDate,
        isLunar: input.isLunar,
        fatherSurname: input.fatherSurname || null,
        fatherZodiac: input.fatherZodiac || null,
        motherSurname: input.motherSurname || null,
        motherZodiac: input.motherZodiac || null,
        childZodiac: input.childZodiac || null,
        resultJson: JSON.stringify(result),
        interpretation: null,
      },
    });

    return NextResponse.json({ id: evaluation.id, result });
  } catch (error) {
    console.error("Evaluate API error:", error);
    return NextResponse.json({ error: "评测失败，请稍后重试" }, { status: 500 });
  }
}
