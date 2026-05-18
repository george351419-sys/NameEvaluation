import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { NamingInput, NamingResult } from "@/types";

export async function POST(req: Request) {
  try {
    const { input, result }: { input: NamingInput; result: NamingResult } = await req.json();
    const record = await prisma.namingEvaluation.create({
      data: {
        surname: input.surname,
        ownZodiac: input.ownZodiac,
        fatherSurname: input.fatherSurname,
        fatherZodiac: input.fatherZodiac ?? null,
        motherSurname: input.motherSurname,
        motherZodiac: input.motherZodiac,
        resultJson: JSON.stringify(result),
      },
    });
    return NextResponse.json({ id: record.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
