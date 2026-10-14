import { cn } from "@/lib/utils";
import { SERVICES, type ServiceKey } from "@/features/admin/services";

/** 서비스 색 네모 아이콘 — 페이지 제목 옆·카드에 쓴다(이모지 대신, 2026-10-14). */
export function ServiceIcon({ service, size = "md" }: { service: ServiceKey; size?: "sm" | "md" }) {
  const s = SERVICES[service];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center font-black",
        s.square,
        size === "md" ? "h-10 w-10 rounded-xl text-sm" : "h-6 w-6 rounded-lg text-[11px]",
      )}
    >
      {s.short}
    </span>
  );
}
