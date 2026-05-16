"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
}

export function ShareButton({ name }: Props) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const mod = await import("html2canvas-pro");
      const html2canvas = mod.default ?? (mod as unknown as (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>);
      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;

      const canvas = await html2canvas(main, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fffbeb",
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${name}-命理报告.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("截图失败", e);
      alert(`生成图片失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleShare} disabled={loading} variant="outline" size="sm">
      {loading ? "生成中..." : "分享报告"}
    </Button>
  );
}
