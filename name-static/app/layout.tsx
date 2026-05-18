import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "名字评测 - 姓名命理分析",
  description: "基于笔画数命理、梅花易数、干支能量三大体系，AI 深度解读您的姓名密码",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
