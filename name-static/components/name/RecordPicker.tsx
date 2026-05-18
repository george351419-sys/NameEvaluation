"use client";

import { useEffect, useState } from "react";
import { listEvaluations } from "@/lib/storage";

interface EvaluationItem {
  id: string;
  surname: string;
  givenName: string;
  birthDate: string;
  isLunar: boolean;
}

interface Props {
  value: string;
  onChange: (id: string, label: string) => void;
  exclude?: string;
}

export function RecordPicker({ value, onChange, exclude }: Props) {
  const [records, setRecords] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = listEvaluations();
    setRecords(data);
    setLoading(false);
  }, []);

  const filtered = exclude ? records.filter((r) => r.id !== exclude) : records;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      onChange("", "");
      return;
    }
    const rec = filtered.find((r) => r.id === id);
    if (rec) {
      const label = `${rec.surname}${rec.givenName} · ${rec.birthDate}`;
      onChange(id, label);
    }
  };

  if (loading) {
    return (
      <select disabled className="w-full border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground">
        <option>加载中…</option>
      </select>
    );
  }

  if (filtered.length === 0) {
    return (
      <select disabled className="w-full border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground">
        <option>暂无可对比的记录</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">请选择记录…</option>
      {filtered.map((r) => (
        <option key={r.id} value={r.id}>
          {r.surname}{r.givenName} · {r.birthDate}{r.isLunar ? "（农历）" : ""}
        </option>
      ))}
    </select>
  );
}
