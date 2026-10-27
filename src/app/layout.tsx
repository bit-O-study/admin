import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// 라틴·숫자는 Geist, 한글은 앱에 포함한 Pretendard(외부 CDN 없음, 쓰이는 글자만 내려받는 분할본).
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "BOadmin",
  description: "헬쑤 · 메모 moa · 아이큐 · 위스키 통합 관리자 콘솔",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* BOadmin 안드로이드 앱(WebView, UA 에 "; wv)")이면 안전 영역 여백을 끈다. 첫 그림 전에 정한다. */}
        <script dangerouslySetInnerHTML={{ __html: `if(navigator.userAgent.indexOf("; wv)")>-1)document.documentElement.dataset.shell="app"` }} />
      </head>
      <body className="bg-canvas font-sans text-[14px] text-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
