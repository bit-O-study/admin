import type { ReactNode } from "react";

/** 설정 화면의 한 묶음 — 넓은 화면에서 왼쪽 제목·설명, 오른쪽 조작. 2026-10-27. */
export function SettingsSection({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line pt-6 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="mt-1 text-[13px] leading-6 text-zinc-500">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
