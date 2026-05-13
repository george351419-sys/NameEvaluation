import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { AnalysisResult } from "@/types";

// GET /api/evaluation - 获取历史列表
export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        surname: true,
        givenName: true,
        birthDate: true,
        isLunar: true,
        createdAt: true,
      },
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("GET evaluations error:", error);
    return NextResponse.json({ error: "获取历史记录失败" }, { status: 500 });
  }
}

// POST /api/evaluation - 保存新评测
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      customName?: string;
      result: AnalysisResult;
      interpretation?: string;
    };

    const { customName, result, interpretation } = body;
    const { input, nameParts } = result;

    const name =
      customName ||
      `${input.surname}${input.givenName}_${new Date().toISOString().slice(0, 19).replace("T", " ")}`;

    const evaluation = await prisma.evaluation.create({
      data: {
        name,
        surname: input.surname,
        givenName: input.givenName,
        nameFirst: nameParts.nameFirst,
        nameLast: nameParts.nameLast,
        birthDate: input.birthDate,
        isLunar: input.isLunar,
        fatherSurname: input.fatherSurname || null,
        fatherZodiac: input.fatherZodiac || null,
        motherSurname: input.motherSurname || null,
        motherZodiac: input.motherZodiac || null,
        childZodiac: input.childZodiac || null,
        resultJson: JSON.stringify(result),
        interpretation: interpretation || null,
      },
    });

    return NextResponse.json({ id: evaluation.id, name: evaluation.name });
  } catch (error) {
    console.error("POST evaluation error:", error);
    return NextResponse.json({ error: "保存评测失败" }, { status: 500 });
  }
}
