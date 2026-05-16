"use client";

import { useState } from "react";
import type { AnalysisResult, NameInput } from "@/types";
import { RecordPicker } from "./RecordPicker";
import { CompareView } from "./CompareView";

interface Props {
  currentResult: AnalysisResult;
}

interface EvaluationRecord {
  id: string;
  surname: string;
  givenName: string;
  birthDate: string;
  isLunar: boolean;
  fatherSurname: string | null;
  fatherZodiac: string | null;
  motherSurname: string | null;
  motherZodiac: string | null;
  childZodiac: string | null;
}

export function CompareInline({ currentResult }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [compareResult, setCompareResult] = useState<AnalysisResult | null>(null);
  const [compareBirth, setCompareBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePickRecord = async (id: string, label: string) => {
    setSelectedId(id);
    setSelectedLabel(label);
    setCompareResult(null);
    setError("");

    if (!id) return;

    setLoading(true);
    try {
      // Fetch the evaluation details
      const evalRes = await fetch(`/api/evaluation/${id}`);
      if (!evalRes.ok) throw new Error("获取记录失败");
      const ev: EvaluationRecord = await evalRes.json();

      // Build NameInput and calculate
      const input: NameInput = {
        surname: ev.surname,
        givenName: ev.givenName,
        birthDate: ev.birthDate,
        isLunar: ev.isLunar,
        fatherSurname: ev.fatherSurname ?? undefined,
        fatherZodiac: ev.fatherZodiac ?? undefined,
        motherSurname: ev.motherSurname ?? undefined,
        motherZodiac: ev.motherZodiac ?? undefined,
        childZodiac: ev.childZodiac ?? undefined,
      };

      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!calcRes.ok) throw new Error("计算失败");
      const { result } = await calcRes.json() as { result: AnalysisResult };

      setCompareResult(result);
      setCompareBirth(`${ev.birthDate}${ev.isLunar ? "（农历）" : ""}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const currentLabel = `${currentResult.input.surname}${currentResult.input.givenName}`;
  const currentBirth = `${currentResult.input.birthDate}${currentResult.input.isLunar ? "（农历）" : ""}`;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-amber-900 hover:bg-amber-100/50 transition-colors rounded-lg"
      >
        <span>对比已有记录</span>
        <span className="text-amber-600">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">选择要对比的记录</label>
            <RecordPicker
              value={selectedId}
              onChange={handlePickRecord}
            />
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground text-center py-4">计算中…</p>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center py-2">{error}</p>
          )}

          {compareResult && !loading && (
            <CompareView
              labelA={currentLabel}
              birthA={currentBirth}
              resultA={currentResult}
              labelB={selectedLabel.split(" · ")[0]}
              birthB={compareBirth}
              resultB={compareResult}
            />
          )}
        </div>
      )}
    </div>
  );
}
