import { Suspense } from "react";
import CompanyResultContent from "./CompanyResultContent";

export default function CompanyResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <CompanyResultContent />
    </Suspense>
  );
}
