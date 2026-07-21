import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "통합 관리자 · heltch admin",
  description: "양주 가격조회 · 아이큐 · 헬스앱 통합 관리자 콘솔",
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