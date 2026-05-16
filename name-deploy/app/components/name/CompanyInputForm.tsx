"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyStrokeAnalysisCard } from "./CompanyStrokeAnalysisCard";
import { PlumBlossomCard } from "./PlumBlossomAnalysis";
import { CompanyEnergyMatrixCard } from "./CompanyEnergyMatrixCard";
import type { CompanyInput, CompanyAnalysisResult } from "@/types";

const DEFAULT_FORM: CompanyInput = {
  companyName: "",
  founderName: "",
  partnerNames: [""],
};

export function CompanyInputForm() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyInput>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompanyAnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canSubmit = !!form.companyName.trim() && !!form.founderName.trim();

  const updatePartner = (index: number, value: string) => {
    setResult(null);
    setForm((prev) => {
      const next = [...prev.partnerNames];
      next[index] = value;
      return { ...prev, partnerNames: next };
    });
  };

  const addPartner = () => {
    setForm((prev) => ({ ...prev, partnerNames: [...prev.partnerNames, ""] }));
  };

  const removePartner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      partnerNames: prev.partnerNames.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload: CompanyInput = {
        ...form,
        partnerNames: form.partnerNames.filter((n) => n.trim()),
      };
      const res = await fetch("/api/company-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data.result);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/company-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/company/result/${data.id}`);
      } else {
        setSaveError(data.error ?? "保存失败，请稍后重试");
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">公司基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                公司名字 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => { setResult(null); setForm((p) => ({ ...p, companyName: e.target.value })); }}
                placeholder="请输入公司名字（不含有限公司等后缀）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="founderName">
                创始人姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="founderName"
                value={form.founderName}
                onChange={(e) => { setResult(null); setForm((p) => ({ ...p, founderName: e.target.value })); }}
                placeholder="请输入创始人姓名"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">合伙人信息（选填）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.partnerNames.map((name, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={name}
                  onChange={(e) => updatePartner(i, e.target.value)}
                  placeholder={`合伙人${i + 1}姓名`}
                />
                {form.partnerNames.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePartner(i)}>
                    移除
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPartner}>
              + 添加合伙人
            </Button>
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

      {result && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-900">
              {result.input.companyName} 公司命理排盘
            </h2>
            <Button onClick={handleSave} disabled={saving} variant="default" size="sm">
              {saving ? "保存中..." : "保存并查看完整报告 →"}
            </Button>
          </div>
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              保存失败：{saveError}
            </div>
          )}

          <CompanyStrokeAnalysisCard data={result.strokeAnalysis} />
          <PlumBlossomCard data={result.plumBlossom} isCompany />
          <CompanyEnergyMatrixCard data={result.energyAnalysis} />

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
