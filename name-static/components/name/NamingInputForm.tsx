"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZodiacSelect } from "./ZodiacSelect";
import { NamingSuggestionResult } from "./NamingSuggestionResult";
import type { NamingInput, NamingResult } from "@/types";
import { suggestNaming } from "@/lib/namingSuggestion";
import { saveNamingEvaluation } from "@/lib/storage";

const DEFAULT_FORM: NamingInput = {
  surname: "",
  ownZodiac: "",
  fatherSurname: "",
  fatherZodiac: "",
  motherSurname: "",
  motherZodiac: "",
};

export function NamingInputForm() {
  const router = useRouter();
  const [form, setForm] = useState<NamingInput>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<NamingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof NamingInput, value: string) => {
    setResult(null);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "surname" && (prev.fatherSurname === "" || prev.fatherSurname === prev.surname)) {
        next.fatherSurname = value;
      }
      return next;
    });
  };

  const canSubmit =
    !!form.surname && !!form.ownZodiac && !!form.fatherSurname &&
    !!form.motherSurname && !!form.motherZodiac;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const input: NamingInput = {
        surname: form.surname,
        ownZodiac: form.ownZodiac,
        fatherSurname: form.fatherSurname,
        fatherZodiac: form.fatherZodiac,
        motherSurname: form.motherSurname,
        motherZodiac: form.motherZodiac,
      };
      const namingResult = suggestNaming(input);
      setResult(namingResult);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    setSaving(true);
    try {
      const id = saveNamingEvaluation({
        surname: result.input.surname,
        ownZodiac: result.input.ownZodiac,
        fatherSurname: result.input.fatherSurname,
        fatherZodiac: result.input.fatherZodiac,
        motherSurname: result.input.motherSurname,
        motherZodiac: result.input.motherZodiac,
        resultJson: JSON.stringify(result),
      });
      router.push(`/naming/result?id=${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  姓 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  placeholder="请输入姓氏"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  属相 <span className="text-red-500">*</span>
                </Label>
                <ZodiacSelect
                  value={form.ownZodiac}
                  onChange={(v) => update("ownZodiac", v)}
                  placeholder="选择属相"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  父亲姓 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.fatherSurname}
                  onChange={(e) => update("fatherSurname", e.target.value)}
                  placeholder="默认与姓相同"
                />
              </div>
              <div className="space-y-2">
                <Label>父亲属相</Label>
                <ZodiacSelect
                  value={form.fatherZodiac ?? ""}
                  onChange={(v) => update("fatherZodiac", v)}
                  placeholder="选填父亲属相"
                  allowClear
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  母亲姓 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.motherSurname}
                  onChange={(e) => update("motherSurname", e.target.value)}
                  placeholder="请输入母亲姓氏"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  母亲属相 <span className="text-red-500">*</span>
                </Label>
                <ZodiacSelect
                  value={form.motherZodiac}
                  onChange={(v) => update("motherZodiac", v)}
                  placeholder="选择母亲属相"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading || !canSubmit}>
          {loading ? "分析中..." : "开始分析"}
        </Button>
      </form>

      {result && (
        <div className="space-y-6">
          <NamingSuggestionResult data={result} />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-base bg-amber-700 hover:bg-amber-800 text-white"
          >
            {saving ? "保存中..." : "保存到历史记录"}
          </Button>
        </div>
      )}
    </div>
  );
}
