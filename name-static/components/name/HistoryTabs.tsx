"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryMultiSelect } from "./HistoryMultiSelect";
import { DeleteButton } from "./DeleteButton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PersonalItem {
  id: string;
  surname: string;
  givenName: string;
  birthDate: string;
  isLunar: boolean;
  createdAt: Date;
}

interface CompanyItem {
  id: string;
  companyName: string;
  founderName: string;
  createdAt: Date;
}

interface NamingItem {
  id: string;
  surname: string;
  ownZodiac: string;
  fatherSurname: string;
  fatherZodiac: string | null;
  motherSurname: string;
  motherZodiac: string;
  createdAt: Date;
}

interface Props {
  personalEvaluations: PersonalItem[];
  companyEvaluations: CompanyItem[];
  namingEvaluations: NamingItem[];
  defaultTab?: string;
  onDeletePersonal?: (id: string) => void;
  onDeleteCompany?: (id: string) => void;
  onDeleteNaming?: (id: string) => void;
}

function CompanyHistoryList({ evaluations, onDelete }: { evaluations: CompanyItem[]; onDelete?: (id: string) => void }) {
  const router = useRouter();
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const enterCompare = () => { setCompareMode(true); setSelected([]); };
  const exitCompare = () => { setCompareMode(false); setSelected([]); };

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    const [a, b, c] = selected;
    const params = new URLSearchParams({ a, b, ...(c ? { c } : {}) });
    router.push(`/company/compare?${params.toString()}`);
  };

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>暂无公司评测记录</p>
        <Link href="/company" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          开始第一次公司评测
        </Link>
      </div>
    );
  }

  return (
    <>
      {!compareMode ? (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-amber-900">想对比不同公司名字的命理吉凶？</p>
            <p className="text-xs text-amber-700 mt-0.5">勾选 2–3 个记录，一键并排对比</p>
          </div>
          <Button onClick={enterCompare} className="bg-amber-700 hover:bg-amber-800 text-white shrink-0 ml-4">
            开始对比
          </Button>
        </div>
      ) : (
        <div className="sticky top-[57px] z-20 mb-5 rounded-xl border border-amber-300 bg-amber-50/95 backdrop-blur-sm px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900">
                选择要对比的公司（已选 {selected.length} / 最多 3 个）
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {selected.length < 2
                  ? `请再选 ${2 - selected.length} 个`
                  : selected.length === 3
                  ? "已选满，可开始对比"
                  : "可再加 1 个，或直接开始对比"}
              </p>
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <Button variant="ghost" size="sm" onClick={exitCompare}>取消</Button>
              <Button
                size="sm"
                className="bg-amber-700 hover:bg-amber-800 text-white"
                disabled={selected.length < 2}
                onClick={handleCompare}
              >
                开始对比 →
              </Button>
            </div>
          </div>
          {selected.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {selected.map((id, idx) => {
                const ev = evaluations.find((e) => e.id === id);
                if (!ev) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 text-xs bg-amber-200 text-amber-900 rounded px-2 py-0.5">
                    <span className="font-bold text-amber-600">{["A", "B", "C"][idx]}</span>
                    {ev.companyName}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {evaluations.map((ev) => {
          const isChecked = selected.includes(ev.id);
          const isDisabled = compareMode && !isChecked && selected.length >= 3;
          return (
            <Card
              key={ev.id}
              className={cn(
                "transition-shadow",
                compareMode ? "cursor-pointer" : "hover:shadow-md",
                isChecked && "ring-2 ring-amber-400 border-amber-300 bg-amber-50/40",
                isDisabled && "opacity-40"
              )}
              onClick={compareMode ? () => !isDisabled && toggle(ev.id) : undefined}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  {compareMode && (
                    <div className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isChecked ? "bg-amber-600 border-amber-600 text-white" : "border-gray-300 bg-white"
                    )}>
                      {isChecked && (
                        <span className="text-[11px] font-bold leading-none">
                          {["A", "B", "C"][selected.indexOf(ev.id)]}
                        </span>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-amber-900">{ev.companyName}</span>
                      <span className="text-sm text-muted-foreground">创始人：{ev.founderName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ev.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
                {!compareMode && (
                  <div className="flex gap-2">
                    <Link
                      href={`/company/result?id=${ev.id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      查看
                    </Link>
                    <DeleteButton id={ev.id} onDelete={onDelete ?? (() => {})} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function NamingHistoryList({ evaluations, onDelete }: { evaluations: NamingItem[]; onDelete?: (id: string) => void }) {
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>暂无命名建议记录</p>
        <Link href="/naming" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          开始第一次命名分析
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evaluations.map((ev) => (
        <Card key={ev.id} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-amber-900">{ev.surname}姓</span>
                <span className="text-sm text-muted-foreground">属相：{ev.ownZodiac}</span>
                <span className="text-sm text-muted-foreground">
                  父{ev.fatherSurname}
                  {ev.fatherZodiac ? `·${ev.fatherZodiac}` : ""}
                </span>
                <span className="text-sm text-muted-foreground">
                  母{ev.motherSurname}·{ev.motherZodiac}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(ev.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/naming/result?id=${ev.id}`}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                查看
              </Link>
              <DeleteButton id={ev.id} onDelete={onDelete ?? (() => {})} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HistoryTabs({ personalEvaluations, companyEvaluations, namingEvaluations, defaultTab, onDeletePersonal, onDeleteCompany, onDeleteNaming }: Props) {
  return (
    <Tabs defaultValue={defaultTab ?? "personal"}>
      <TabsList className="w-full">
        <TabsTrigger value="personal" className="flex-1">
          人名记录（{personalEvaluations.length}）
        </TabsTrigger>
        <TabsTrigger value="company" className="flex-1">
          公司记录（{companyEvaluations.length}）
        </TabsTrigger>
        <TabsTrigger value="naming" className="flex-1">
          命名建议（{namingEvaluations.length}）
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="mt-6">
        <HistoryMultiSelect evaluations={personalEvaluations} onDelete={onDeletePersonal} />
      </TabsContent>

      <TabsContent value="company" className="mt-6">
        <CompanyHistoryList evaluations={companyEvaluations} onDelete={onDeleteCompany} />
      </TabsContent>

      <TabsContent value="naming" className="mt-6">
        <NamingHistoryList evaluations={namingEvaluations} onDelete={onDeleteNaming} />
      </TabsContent>
    </Tabs>
  );
}
