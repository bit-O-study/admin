/**
 * 헬쑤 고객센터(문의) — 순수 모듈. 라벨·필터 해석·검증만 담당(DB 접근 없음 → 단위 테스트 가능).
 * 테이블/RPC 는 헬쑤앱 supabase(support_*)에 있고, 회원 화면(/support)은 헬쑤앱에 남는다.
 */
export const SUPPORT_CATEGORIES = {
  bug: "버그 신고",
  feedback: "불편 신고",
  idea: "기능 제안",
  other: "기타 문의",
} as const;

export const SUPPORT_STATUSES = {
  new: "접수",
  in_progress: "확인 중",
  waiting_user: "답변 대기",
  resolved: "해결",
  closed: "종료",
} as const;

export const SUPPORT_PRIORITIES = {
  normal: "일반",
  high: "높음",
  urgent: "긴급",
} as const;

export const SUPPORT_DELIVERY = {
  queued: "발송 대기",
  processing: "처리 중",
  api_succeeded: "카카오 API 전송 성공",
  failed: "실패",
  unknown: "전송 여부 확인 필요",
  quota_deferred: "무료 한도 대기",
  needs_reconnect: "카카오 재연결 필요",
  canceled: "취소",
} as const;

export type SupportCategory = keyof typeof SUPPORT_CATEGORIES;
export type SupportStatus = keyof typeof SUPPORT_STATUSES;

export type SupportTicket = {
  id: string;
  number: number;
  user_id: string;
  title: string;
  category: SupportCategory;
  status: SupportStatus;
  priority: string;
  assignee: string | null;
  diagnostics: Record<string, string>;
  created_at: string;
  updated_at: string;
  admin_read_at: string | null;
};

export const SUPPORT_PAGE_SIZE = 20;
export const SUPPORT_BASE = "/admin/health/support";

export type SupportFilters = {
  page?: string;
  status?: string;
  category?: string;
  q?: string;
  mine?: string;
  from?: string;
  to?: string;
};

export type SupportQuery = {
  page: number;
  status: SupportStatus | null;
  category: SupportCategory | null;
  /** 숫자만이면 접수번호, 아니면 제목 부분일치(ilike 이스케이프 완료). */
  number: number | null;
  titleLike: string | null;
  mine: boolean;
  /** KST 하루 경계로 바꾼 ISO 문자열. */
  from: string | null;
  to: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

/** URL 검색 파라미터 → 안전한 쿼리 조건. 모르는 값은 버린다. */
export function parseSupportFilters(f: SupportFilters): SupportQuery {
  const page = Math.max(1, Math.min(1000, Number.parseInt(f.page ?? "1") || 1));
  const search = (f.q ?? "").trim().slice(0, 100);
  const isNumber = /^\d{1,9}$/.test(search);
  return {
    page,
    status: f.status && Object.hasOwn(SUPPORT_STATUSES, f.status) ? (f.status as SupportStatus) : null,
    category:
      f.category && Object.hasOwn(SUPPORT_CATEGORIES, f.category)
        ? (f.category as SupportCategory)
        : null,
    number: search && isNumber ? Number(search) : null,
    titleLike: search && !isNumber ? `%${search.replace(/[%_\\]/g, "\\$&")}%` : null,
    mine: f.mine === "1",
    from: DATE.test(f.from ?? "") ? `${f.from}T00:00:00+09:00` : null,
    to: DATE.test(f.to ?? "") ? `${f.to}T23:59:59+09:00` : null,
  };
}

/** 현재 필터를 유지한 채 페이지만 바꾼 목록 링크. */
export function supportPageHref(f: SupportFilters, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v && k !== "page") params.set(k, v);
  params.set("page", String(page));
  return `${SUPPORT_BASE}?${params}`;
}

/** 관리자 답변/메모 본문 검증 — RPC 호출 전 1차 방어. */
export function validateSupportReply(body: string): string | null {
  const t = body.trim();
  if (!t || body.length > 5000) return "내용은 1~5000자로 입력해 주세요.";
  return null;
}

export function isSupportManageInput(status: string, priority: string): boolean {
  return Object.hasOwn(SUPPORT_STATUSES, status) && Object.hasOwn(SUPPORT_PRIORITIES, priority);
}

export function formatSupportTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}
