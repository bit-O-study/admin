import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "BOadmin",
  description: "헬쑤 · 메모(moa) · 아이큐 · 양주 가격조회 통합 관리자 콘솔",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-zinc-100 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}