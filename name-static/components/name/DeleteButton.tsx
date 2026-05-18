"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  onDelete: (id: string) => void;
}

export function DeleteButton({ id, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (!confirm("确认删除这条记录？")) return;
    setLoading(true);
    onDelete(id);
    setLoading(false);
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
