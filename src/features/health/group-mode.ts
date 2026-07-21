/** 그룹탭 전역 모드 레지스트리 — 순수 모듈. (헬스앱에서 이식) */
export const GROUP_MODES = ["gym", "proof"] as const;

export type GroupMode = (typeof GROUP_MODES)[number];

export const GROUP_MODE_KEY = "group.mode";

export const DEFAULT_GROUP_MODE: GroupMode = "gym";

export const GROUP_MODE_LABEL: Record<GroupMode, string> = {
  gym: "헬스장(공유펫·랭킹)",
  proof: "오늘 운동 인증(움짤)",
};

export const GROUP_MODE_HINT: Record<GroupMode, string> = {
  gym: "기존 그룹 헬스장 — 공유펫·주간 랭킹·챌린지·응원",
  proof: "그룹원이 오늘 운동 인증을 3초 움짤로 올리는 피드",
};

export function isGroupMode(v: unknown): v is GroupMode {
  return v === "gym" || v === "proof";
}

export function parseGroupMode(value: unknown): GroupMode {
  return value === "proof" ? "proof" : DEFAULT_GROUP_MODE;
}