import { Suspense } from "react";
import NamingResultContent from "./NamingResultContent";

export default function NamingResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <NamingResultContent />
    </Suspense>
  );
}
