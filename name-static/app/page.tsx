import { NameInputForm } from "@/components/name/NameInputForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf5] to-[#efe8d8]">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-[#3d2b10]">名字评测</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <Link href="/" className="px-3 py-1.5 bg-gradient-to-r from-[#8b653a] to-[#c4954a] text-white font-medium">
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
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[rgba(196,149,74,0.1)] border border-[rgba(196,149,74,0.3)] rounded-full px-4 py-1 text-xs text-[#8b653a] tracking-widest mb-3">
            ✦ 传统命理 · 现代解读
          </div>
          <h2 className="text-3xl font-bold text-[#3d2b10] tracking-[0.2em]">姓名命理评测</h2>
          <p className="text-[#9b7d5a]">
            基于笔画数命理、梅花易数、干支能量三大体系，深度解读您的姓名密码
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[rgba(196,149,74,0.5)]" />
            <span className="text-[#c4954a] text-xs">◆</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[rgba(196,149,74,0.5)]" />
          </div>
        </div>
        <NameInputForm />
      </main>
    </div>
  );
}
