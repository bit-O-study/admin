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
  clazz: string | null;
  sweet: number | null;
  smoky: number | null;
  fruity: number | null;
  spicy: number | null;
  woody: number | null;
  body: number | null;
  updatedAt: string;
  /** 최신 crawled_at 기준 대표 가격(없을 수 있음). */
  latestPrice: LiquorPrice | null;
};

/** 향 프로필 축(레이더 차트) — 0~10 척도. */
export const FLAVOR_AXES = [
  "sweet",
  "smoky",
  "fruity",
  "spicy",
  "woody",
  "body",
] as const;
export type FlavorAxis = (typeof FLAVOR_AXES)[number];
export const FLAVOR_LABEL: Record<FlavorAxis, string> = {
  sweet: "단맛",
  smoky: "스모키",
  fruity: "과일향",
  spicy: "스파이시",
  woody: "우디",
  body: "바디",
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
  clazz: string | null;
  sweet: number | null;
  smoky: number | null;
  fruity: number | null;
  spicy: number | null;
  woody: number | null;
  body: number | null;
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

/**
 * 판매처(source) 화이트리스트 — 양주 DB 의 liquor_price/liquor_price_history CHECK
 * 제약과 일치해야 한다(그 외 값은 insert 가 거부됨). 크롤러/원본 앱과 동일한 5종.
 */
export const PRICE_SOURCES = [
  "EMART_TRADERS",
  "EMART",
  "COSTCO",
  "LOTTEON",
  "HOMEPLUS",
] as const;
export type PriceSource = (typeof PRICE_SOURCES)[number];
export const PRICE_SOURCE_LABEL: Record<PriceSource, string> = {
  EMART_TRADERS: "이마트 트레이더스",
  EMART: "이마트",
  COSTCO: "코스트코",
  LOTTEON: "롯데온",
  HOMEPLUS: "홈플러스",
};

/** 가격 입력 폼(문자열). */
export type PriceInput = {
  source?: string;
  currentPrice?: string;
  originalPrice?: string;
  productUrl?: string;
};

/** 검증된 가격 입력. */
export type PricePatch = {
  source: PriceSource;
  currentPrice: number;
  originalPrice: number;
  productUrl: string | null;
};

export type PriceValidation =
  | { ok: true; patch: PricePatch }
  | { ok: false; error: string };

/**
 * 가격 입력 검증 — 판매처는 화이트리스트, 현재가는 0 초과 정수, 정상가(생략시 현재가와
 * 동일)는 현재가 이상. 원본 앱(manual-price) 규칙과 동일. 숫자는 콤마 등 제거 후 파싱.
 */
export function validatePriceInput(input: PriceInput): PriceValidation {
  const source = (input.source ?? "").trim().toUpperCase();
  if (!source) return { ok: false, error: "판매처(source)를 선택하세요." };
  if (!(PRICE_SOURCES as readonly string[]).includes(source)) {
    return { ok: false, error: `지원하지 않는 판매처입니다: ${source}` };
  }

  const currentPrice = parsePriceInt(input.currentPrice);
  if (currentPrice === null || currentPrice <= 0) {
    return { ok: false, error: "현재가는 0보다 큰 정수여야 합니다." };
  }

  const rawOriginal = (input.originalPrice ?? "").trim();
  let originalPrice = parsePriceInt(input.originalPrice);
  if (rawOriginal !== "" && originalPrice === null) {
    return { ok: false, error: "정상가는 숫자여야 합니다." };
  }
  if (originalPrice === null) originalPrice = currentPrice;
  if (originalPrice < currentPrice) {
    return { ok: false, error: "정상가는 현재가 이상이어야 합니다." };
  }

  const productUrl = (input.productUrl ?? "").trim() || null;
  if (productUrl && !isHttpUrl(productUrl)) {
    return { ok: false, error: "상품 URL 은 http(s) 형식이어야 합니다." };
  }

  return {
    ok: true,
    patch: {
      source: source as PriceSource,
      currentPrice,
      originalPrice,
      productUrl,
    },
  };
}

/** 가격 문자열 → 정수(숫자 외 문자 제거). 빈 값/파싱불가는 null. */
function parsePriceInt(s: string | undefined): number | null {
  const t = (s ?? "").replace(/[^0-9]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
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
  clazz?: string;
  sweet?: string;
  smoky?: string;
  fruity?: string;
  spicy?: string;
  woody?: string;
  body?: string;
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

  const flavors: Record<FlavorAxis, number | null> = {
    sweet: null,
    smoky: null,
    fruity: null,
    spicy: null,
    woody: null,
    body: null,
  };
  for (const axis of FLAVOR_AXES) {
    const v = parseNullableScore(input[axis]);
    if (v === INVALID) {
      return {
        ok: false,
        error: `${FLAVOR_LABEL[axis]} 값은 0~10 사이 숫자여야 합니다.`,
      };
    }
    flavors[axis] = v;
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
      clazz: emptyToNull(input.clazz),
      ...flavors,
    },
  };
}

/** 향 프로필 점수 파싱 — 0~10 (소수 허용). 빈 값은 null. */
function parseNullableScore(
  s: string | undefined,
): number | null | typeof INVALID {
  const t = (s ?? "").trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 10) return INVALID;
  return n;
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