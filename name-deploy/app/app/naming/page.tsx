import { NamingInputForm } from "@/components/name/NamingInputForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NamingPage() {
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
              <Link href="/" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors">
                人名评测
              </Link>
              <Link href="/company" className="px-3 py-1.5 bg-white text-muted-foreground hover:bg-muted/50 transition-colors border-l">
                公司评测
              </Link>
              <Link href="/naming" className="px-3 py-1.5 bg-amber-700 text-white font-medium border-l">
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
          <h2 className="text-3xl font-bold text-amber-900">人名命名建议</h2>
          <p className="text-muted-foreground">
            输入姓氏和父母信息，系统将推算最适合的名字总笔画数
          </p>
        </div>
        <NamingInputForm />
      </main>
    </div>
  );
}
