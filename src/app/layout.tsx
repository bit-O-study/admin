import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "BOadmin",
  description: "헬쑤 · 메모(moa) · 아이큐 · 양주 가격조회 통합 관리자 콘솔",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* BOadmin 안드로이드 앱(WebView, UA 에 "; wv)")이면 안전 영역 여백을 끈다. 첫 그림 전에 정한다. */}
        <script dangerouslySetInnerHTML={{ __html: `if(navigator.userAgent.indexOf("; wv)")>-1)document.documentElement.dataset.shell="app"` }} />
      </head>
      <body className="bg-zinc-100 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}