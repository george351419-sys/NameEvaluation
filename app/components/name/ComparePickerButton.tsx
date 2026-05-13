"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecordPicker } from "./RecordPicker";

interface Props {
  currentId: string;
}

export function ComparePickerButton({ currentId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleChange = (id: string) => {
    if (!id) return;
    router.push(`/compare?a=${currentId}&b=${id}`);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        与其他记录对比
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-lg border bg-white shadow-lg p-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">选择对比记录</p>
          <RecordPicker
            value=""
            onChange={handleChange}
            exclude={currentId}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-right"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
