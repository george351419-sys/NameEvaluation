"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  listEvaluations,
  listCompanyEvaluations,
  listNamingEvaluations,
  deleteEvaluation,
  deleteCompanyEvaluation,
  deleteNamingEvaluation,
} from "@/lib/storage";
import type {
  StoredEvaluation,
  StoredCompanyEvaluation,
  StoredNamingEvaluation,
} from "@/lib/storage";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryTabs } from "@/components/name/HistoryTabs";

function HistoryContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? undefined;

  const [evaluations, setEvaluations] = useState<StoredEvaluation[]>([]);
  const [companyEvaluations, setCompanyEvaluations] = useState<StoredCompanyEvaluation[]>([]);
  const [namingEvaluations, setNamingEvaluations] = useState<StoredNamingEvaluation[]>([]);

  const reload = () => {
    setEvaluations(listEvaluations());
    setCompanyEvaluations(listCompanyEvaluations());
    setNamingEvaluations(listNamingEvaluations());
  };

  useEffect(() => { reload(); }, []);

  const handleDeletePersonal = (id: string) => { deleteEvaluation(id); reload(); };
  const handleDeleteCompany = (id: string) => { deleteCompanyEvaluation(id); reload(); };
  const handleDeleteNaming = (id: string) => { deleteNamingEvaluation(id); reload(); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <h1 className="text-xl font-bold text-amber-900">历史评测记录</h1>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-amber-700 hover:bg-amber-800 text-white")}>
            新评测
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <HistoryTabs
          personalEvaluations={evaluations.map((e) => ({
            id: e.id,
            surname: e.surname,
            givenName: e.givenName,
            birthDate: e.birthDate,
            isLunar: e.isLunar,
            createdAt: new Date(e.createdAt),
          }))}
          companyEvaluations={companyEvaluations.map((e) => ({
            id: e.id,
            companyName: e.companyName,
            founderName: e.founderName,
            createdAt: new Date(e.createdAt),
          }))}
          namingEvaluations={namingEvaluations.map((e) => ({
            id: e.id,
            surname: e.surname,
            ownZodiac: e.ownZodiac,
            fatherSurname: e.fatherSurname,
            fatherZodiac: e.fatherZodiac ?? null,
            motherSurname: e.motherSurname,
            motherZodiac: e.motherZodiac,
            createdAt: new Date(e.createdAt),
          }))}
          defaultTab={tab}
          onDeletePersonal={handleDeletePersonal}
          onDeleteCompany={handleDeleteCompany}
          onDeleteNaming={handleDeleteNaming}
        />
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
