"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  zodiacOverride: "",
  fatherSurname: "",
  fatherZodiac: "",
  motherSurname: "",
  motherZodiac: "",
  childZodiac: "",
};

export function NameInputForm({ initialInput }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NameInput>(initialInput ?? DEFAULT_FORM);
  // birthMode: 用生日推算生肖 or 直接选生肖
  const [birthMode, setBirthMode] = useState<"date" | "zodiac">(
    initialInput?.zodiacOverride ? "zodiac" : "date"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof NameInput, value: string | boolean) => {
    setResult(null);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "surname" && (prev.fatherSurname === "" || prev.fatherSurname === prev.surname)) {
        next.fatherSurname = value as string;
      }
      return next;
    });
  };

  const switchBirthMode = (mode: "date" | "zodiac") => {
    setBirthMode(mode);
    setResult(null);
    if (mode === "zodiac") {
      setForm((prev) => ({ ...prev, birthDate: "", isLunar: false }));
    } else {
      setForm((prev) => ({ ...prev, zodiacOverride: "" }));
    }
  };

  const canSubmit =
    !!form.surname &&
    !!form.givenName &&
    (birthMode === "date" ? !!form.birthDate : !!form.zodiacOverride);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
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
      if (data.id) {
        router.push(`/result/${data.id}`);
      }
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

            {/* 出生信息：双 Tab 切换 */}
            <div className="space-y-2">
              <Label>
                出生信息 <span className="text-red-500">*</span>
              </Label>
              {/* 模式切换 */}
              <div className="flex rounded-lg border overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => switchBirthMode("date")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    birthMode === "date"
                      ? "bg-amber-700 text-white"
                      : "bg-white text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  输入生日
                </button>
                <button
                  type="button"
                  onClick={() => switchBirthMode("zodiac")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors border-l ${
                    birthMode === "zodiac"
                      ? "bg-amber-700 text-white"
                      : "bg-white text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  直接选生肖
                </button>
              </div>

              {birthMode === "date" ? (
                <div className="space-y-2">
                  <Tabs
                    value={form.isLunar ? "lunar" : "solar"}
                    onValueChange={(v) => update("isLunar", v === "lunar")}
                  >
                    <TabsList>
                      <TabsTrigger value="solar">阳历</TabsTrigger>
                      <TabsTrigger value="lunar">农历</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    系统将根据生日（以立春为界）自动判断生肖
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ZodiacSelect
                    value={form.zodiacOverride ?? ""}
                    onChange={(v) => update("zodiacOverride", v)}
                    placeholder="选择生肖属相"
                  />
                  <p className="text-xs text-muted-foreground">
                    不知道具体生日时可直接选生肖
                  </p>
                </div>
              )}
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
          disabled={loading || !canSubmit}
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
            <Button onClick={handleSave} disabled={saving} variant="default" size="sm">
              {saving ? "保存中..." : "保存并查看完整报告 →"}
            </Button>
          </div>

          <StrokeAnalysisCard data={result.strokeAnalysis} />
          <PlumBlossomCard data={result.plumBlossom} />
          <EnergyMatrixCard data={result.energyAnalysis} />

          {/* 对比已有记录 */}
          <CompareInline currentResult={result} />

          {/* 底部保存区 */}
          <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              保存后跳转至完整报告页，可获取 AI 命理解读及分享图片。
            </p>
            <Button onClick={handleSave} disabled={saving} className="ml-4 shrink-0">
              {saving ? "保存中..." : "保存并查看完整报告 →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
