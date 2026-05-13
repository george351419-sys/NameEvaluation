"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZodiacSelect } from "./ZodiacSelect";
import { StrokeAnalysisCard } from "./StrokeAnalysis";
import { PlumBlossomCard } from "./PlumBlossomAnalysis";
import { EnergyMatrixCard } from "./EnergyMatrix";
import { CompareInline } from "./CompareInline";
import type { NameInput, AnalysisResult } from "@/types";

interface Props {
  initialInput?: NameInput;
}

const DEFAULT_FORM: NameInput = {
  surname: "",
  givenName: "",
  birthDate: "",
  isLunar: false,
  fatherSurname: "",
  fatherZodiac: "",
  motherSurname: "",
  motherZodiac: "",
  childZodiac: "",
};

export function NameInputForm({ initialInput }: Props) {
  const [form, setForm] = useState<NameInput>(initialInput ?? DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof NameInput, value: string | boolean) => {
    setResult(null);
    setSavedId(null);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "surname" && (prev.fatherSurname === "" || prev.fatherSurname === prev.surname)) {
        next.fatherSurname = value as string;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.surname || !form.givenName || !form.birthDate) return;
    setLoading(true);
    setSavedId(null);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.result);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();
      if (data.id) setSavedId(data.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {initialInput && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          正在基于历史记录编辑，修改后点击「开始评测」重新计算，结果可另存为新记录。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surname">
                  姓 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="surname"
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  placeholder="请输入姓氏"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="givenName">
                  名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="givenName"
                  value={form.givenName}
                  onChange={(e) => update("givenName", e.target.value)}
                  placeholder="请输入名字"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                出生日期 <span className="text-red-500">*</span>
              </Label>
              <Tabs
                value={form.isLunar ? "lunar" : "solar"}
                onValueChange={(v) => update("isLunar", v === "lunar")}
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="solar">阳历</TabsTrigger>
                  <TabsTrigger value="lunar">农历</TabsTrigger>
                </TabsList>
              </Tabs>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => update("birthDate", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 父母信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">父母及孩子信息（选填）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>父亲姓</Label>
                <Input
                  value={form.fatherSurname}
                  onChange={(e) => update("fatherSurname", e.target.value)}
                  placeholder="默认与姓相同"
                />
              </div>
              <div className="space-y-2">
                <Label>父亲属相</Label>
                <ZodiacSelect value={form.fatherZodiac} onChange={(v) => update("fatherZodiac", v)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>母亲姓</Label>
                <Input
                  value={form.motherSurname}
                  onChange={(e) => update("motherSurname", e.target.value)}
                  placeholder="请输入母亲姓氏"
                />
              </div>
              <div className="space-y-2">
                <Label>母亲属相</Label>
                <ZodiacSelect value={form.motherZodiac} onChange={(v) => update("motherZodiac", v)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>孩子属相</Label>
              <ZodiacSelect
                value={form.childZodiac}
                onChange={(v) => update("childZodiac", v)}
                placeholder="选择孩子属相"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={loading || !form.surname || !form.givenName || !form.birthDate}
        >
          {loading ? "分析中..." : "开始评测"}
        </Button>
      </form>

      {/* 计算结果 */}
      {result && (
        <div ref={resultsRef} className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-900">
              {result.input.surname}{result.input.givenName} 命理排盘
            </h2>
            {!savedId ? (
              <Button onClick={handleSave} disabled={saving} variant="default" size="sm">
                {saving ? "保存中..." : "保存记录"}
              </Button>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-700 font-medium">✓ 已保存</span>
                <Link
                  href={`/result/${savedId}`}
                  className="text-amber-700 underline underline-offset-2 hover:text-amber-900"
                >
                  查看完整报告（含AI解读）→
                </Link>
              </div>
            )}
          </div>

          <StrokeAnalysisCard data={result.strokeAnalysis} />
          <PlumBlossomCard data={result.plumBlossom} />
          <EnergyMatrixCard data={result.energyAnalysis} />

          {/* 对比已有记录 */}
          <CompareInline currentResult={result} />

          {/* 底部保存区 */}
          <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              排盘结果仅在本页展示。保存后可随时查看完整报告及 AI 命理解读。
            </p>
            {!savedId ? (
              <Button onClick={handleSave} disabled={saving} className="ml-4 shrink-0">
                {saving ? "保存中..." : "保存记录"}
              </Button>
            ) : (
              <Link
                href={`/result/${savedId}`}
                className="ml-4 shrink-0 inline-flex items-center justify-center rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 transition-colors"
              >
                查看完整报告 →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
