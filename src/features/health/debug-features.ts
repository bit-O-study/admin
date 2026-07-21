/** 디버그 기능 레지스트리 — 순수 모듈. (헬스앱에서 이식) */
export const DEBUG_FEATURES = [
  {
    id: "steps",
    label: "걸음수 진단칩(🩺 앱UA·브릿지·플러그인·권한·레코드…)",
  },
  {
    id: "equipment-scan",
    label: "기구 사진 분석(📷 기구 식별 + 가능한 운동, Claude 비전)",
  },
  {
    id: "helssu-coach",
    label: "헬쑤쌤 탭(🧑‍🏫 AI 코치 — 기구검색·운동/식단 분석·AI 다짐·자세분석)",
  },
  {
    id: "diet-photo-ai",
    label: "AI 식단 사진 인식(🍱 사진 → 음식·칼로리 자동 추정, NVIDIA 무료 비전)",
  },
] as const;

export type DebugFeatureId = (typeof DEBUG_FEATURES)[number]["id"];

export const debugSettingKey = (id: string) => `debug.${id}`;

export function debugValueEnabled(value: unknown): boolean {
  return value !== false;
}

export type DebugVisibility = "hidden" | "debug" | "public";

export const DEBUG_VISIBILITIES: readonly DebugVisibility[] = [
  "hidden",
  "debug",
  "public",
];

export const DEBUG_VISIBILITY_LABEL: Record<DebugVisibility, string> = {
  hidden: "숨김",
  debug: "디버그 계정만",
  public: "전체 공개",
};

export function isDebugVisibility(v: unknown): v is DebugVisibility {
  return v === "hidden" || v === "debug" || v === "public";
}

export function debugValueToVisibility(value: unknown): DebugVisibility {
  if (value === "public") return "public";
  if (value === false || value === "hidden") return "hidden";
  return "debug";
}

export const DEBUG_ACCOUNTS_KEY = "debug.accounts";

export function normalizeDebugAccounts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== "string") continue;
    const e = v.trim().toLowerCase();
    if (e && !seen.has(e)) {
      seen.add(e);
      out.push(e);
    }
  }
  return out;
}

export function addDebugAccount(list: unknown, email: string): string[] | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return normalizeDebugAccounts([...normalizeDebugAccounts(list), e]);
}

export function removeDebugAccount(list: unknown, email: string): string[] {
  const e = email.trim().toLowerCase();
  return normalizeDebugAccounts(list).filter((x) => x !== e);
}