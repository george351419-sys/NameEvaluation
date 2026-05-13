"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteButton({ id, deleteUrl }: { id: string; deleteUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确认删除这条记录？")) return;
    setLoading(true);
    try {
      await fetch(deleteUrl ?? `/api/evaluation/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "删除中" : "删除"}
    </Button>
  );
}
