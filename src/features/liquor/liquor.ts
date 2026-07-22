/**
 * 주류(양주) 관리 — 순수 타입·헬퍼.
 *
 * ⚠ 이 파일은 서버 전용 의존성을 import 하지 않는다(순수 모듈 → 단위테스트 대상).
 *   실제 DB 접근은 data.ts / actions.ts 에서 adminDb("liquor") 로 한다.
 */

/** liquor 테이블 1행(관리자 목록/편집 대상). */
export type LiquorRow = {
  id: number;
  normalizedName: string;
  brand: string | null;
  category: string | null;
  volumeMl: number | null;
  alcoholPercent: number | null;
  country: string | null;
  productCode: string | null;
  productName: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  updatedAt: string;
  /** 최신 crawled_at 기준 대표 가격(없을 수 있음). */
  latestPrice: LiquorPrice | null;
};

/** liquor_price 테이블 1행(판매처별 가격 이력). */
export type LiquorPrice = {
  id: number;
  liquorId: number;
  source: string;
  currentPrice: number | null;
  originalPrice: number | null;
  crawledAt: string;
};

/** 관리자가 편집할 수 있는 상품 필드. */
export type LiquorPatch = {
  productName: string | null;
  normalizedName: string;
  brand: string | null;
  category: string | null;
  country: string | null;
  volumeMl: number | null;
  alcoholPercent: number | null;
  productUrl: string | null;
  imageUrl: string | null;
};

/** 검색어 정규화 — 앞뒤 공백 제거 + 소문자. */
export function normalizeSearch(q: string): string {
  return q.trim().toLowerCase();
}

/**
 * PostgREST `ilike`/`or` 필터에 안전하게 넣기 위한 검색어 정제.
 * 필터 문법을 깨뜨리는 문자(`, ( ) % *`)와 제어문자를 제거한다.
 */
export function sanitizeLikeTerm(q: string): string {
  return q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
}

/** 가격 이력에서 최신(crawled_at 최대) 1건을 고른다. 없으면 null. */
export function pickLatestPrice(prices: LiquorPrice[]): LiquorPrice | null {
  let best: LiquorPrice | null = null;
  for (const p of prices) {
    if (!best || p.crawledAt > best.crawledAt) best = p;
  }
  return best;
}

/** 원화 표기. null/음수/NaN 은 "-". */
export function formatKrw(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n < 0) return "-";
  return `₩${Math.round(n).toLocaleString("ko-KR")}`;
}

/**
 * 할인율(%) — original 대비 current 가 얼마나 낮은지. 정수 반올림.
 * original 이 없거나 current 가 original 이상이면 null(할인 아님).
 */
export function discountRate(
  current: number | null | undefined,
  original: number | null | undefined,
): number | null {
  if (
    current == null ||
    original == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(original) ||
    original <= 0 ||
    current >= original
  ) {
    return null;
  }
  return Math.round((1 - current / original) * 100);
}

/** http(s) URL 인지. 빈 문자열은 false. */
export function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type PatchValidation =
  | { ok: true; patch: LiquorPatch }
  | { ok: false; error: string };

/** 폼 입력(문자열 위주)을 검증·정규화해 LiquorPatch 로 변환. */
export function validateLiquorPatch(input: {
  productName?: string;
  normalizedName?: string;
  brand?: string;
  category?: string;
  country?: string;
  volumeMl?: string;
  alcoholPercent?: string;
  productUrl?: string;
  imageUrl?: string;
}): PatchValidation {
  const normalizedName = (input.normalizedName ?? "").trim();
  if (!normalizedName) {
    return { ok: false, error: "정규화명(normalized_name)은 비울 수 없습니다." };
  }

  const volumeMl = parseNullableInt(input.volumeMl);
  if (volumeMl === INVALID) {
    return { ok: false, error: "용량(ml)은 0 이상 정수여야 합니다." };
  }

  const alcoholPercent = parseNullableFloat(input.alcoholPercent);
  if (alcoholPercent === INVALID) {
    return { ok: false, error: "도수(%)는 0~100 사이 숫자여야 합니다." };
  }

  const productUrl = emptyToNull(input.productUrl);
  if (productUrl && !isHttpUrl(productUrl)) {
    return { ok: false, error: "상품 URL 은 http(s) 형식이어야 합니다." };
  }

  const imageUrl = emptyToNull(input.imageUrl);
  if (imageUrl && !isHttpUrl(imageUrl)) {
    return { ok: false, error: "이미지 URL 은 http(s) 형식이어야 합니다." };
  }

  return {
    ok: true,
    patch: {
      productName: emptyToNull(input.productName),
      normalizedName,
      brand: emptyToNull(input.brand),
      category: emptyToNull(input.category),
      country: emptyToNull(input.country),
      volumeMl,
      alcoholPercent,
      productUrl,
      imageUrl,
    },
  };
}

const INVALID = Symbol("invalid");

function emptyToNull(s: string | undefined): string | null {
  const t = (s ?? "").trim();
  return t === "" ? null : t;
}

function parseNullableInt(s: string | undefined): number | null | typeof INVALID {
  const t = (s ?? "").trim();
  if (t === "") return null;
  if (!/^\d+$/.test(t)) return INVALID;
  return Number(t);
}

function parseNullableFloat(
  s: string | undefined,
): number | null | typeof INVALID {
  const t = (s ?? "").trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100) return INVALID;
  return n;
}