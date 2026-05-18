import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ev = await prisma.companyEvaluation.findUnique({ where: { id } });
    if (!ev) return NextResponse.json({ error: "未找到" }, { status: 404 });
    return NextResponse.json(ev);
  } catch (error) {
    console.error("GET company evaluation error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await request.json()) as { interpretation?: string };
    const ev = await prisma.companyEvaluation.update({
      where: { id },
      data: { interpretation: body.interpretation },
    });
    return NextResponse.json({ id: ev.id });
  } catch (error) {
    console.error("PATCH company evaluation error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.companyEvaluation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE company evaluation error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
