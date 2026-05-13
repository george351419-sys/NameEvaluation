import { NameInputForm } from "@/components/name/NameInputForm";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { NameInput } from "@/types";

interface Props {
  searchParams: Promise<{ edit?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { edit } = await searchParams;

  let initialInput: NameInput | undefined;
  if (edit) {
    const ev = await prisma.evaluation.findUnique({ where: { id: edit } });
    if (ev) {
      initialInput = {
        surname: ev.surname,
        givenName: ev.givenName,
        birthDate: ev.birthDate,
        isLunar: ev.isLunar,
        fatherSurname: ev.fatherSurname ?? "",
        fatherZodiac: ev.fatherZodiac ?? "",
        motherSurname: ev.motherSurname ?? "",
        motherZodiac: ev.motherZodiac ?? "",
        childZodiac: ev.childZodiac ?? "",
      };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">名字评测</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <Link href="/" className="px-3 py-1.5 bg-amber-700 text-white font-medium">
                人名评测
              </Link>
              <Link href="/company" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors border-l">
                公司评测
              </Link>
              <Link href="/naming" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors border-l">
                命名建议
              </Link>
            </div>
            <Link href="/history" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              历史记录
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {!initialInput && (
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-amber-900">姓名命理评测</h2>
            <p className="text-muted-foreground">
              基于笔画数命理、梅花易数、干支能量三大体系，AI 深度解读您的姓名密码
            </p>
          </div>
        )}
        <NameInputForm initialInput={initialInput} />
      </main>
    </div>
  );
}
