import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/evaluation/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluation = await prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation) {
      return NextResponse.json({ error: "未找到该评测记录" }, { status: 404 });
    }
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("GET evaluation by id error:", error);
    return NextResponse.json({ error: "获取评测失败" }, { status: 500 });
  }
}

// DELETE /api/evaluation/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.evaluation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE evaluation error:", error);
    return NextResponse.json({ error: "删除评测失败" }, { status: 500 });
  }
}
