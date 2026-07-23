import "server-only";

import { adminDb } from "@/lib/supabase/admin-clients";
import { seoulDayStartUtcIso } from "@/lib/date";
import {
  pickLatestPrice,
  sanitizeLikeTerm,
  type LiquorPrice,
  type LiquorRow,
} from "@/features/liquor/liquor";

const LIQUOR_COLUMNS =
  "id, normalized_name, brand, category, volume_ml, alcohol_percent, country, product_code, product_name, product_url, image_url, clazz:class, sweet, smoky, fruity, spicy, woody, body, updated_at";

type LiquorRecord = {
  id: number;
  normalized_name: string;
  brand: string | null;
  category: string | null;
  volume_ml: number | null;
  alcohol_percent: number | null;
  country: string | null;
  product_code: string | null;
  product_name: string | null;
  product_url: string | null;
  image_url: string | null;
  clazz: string | null;
  sweet: number | null;
  smoky: number | null;
  fruity: number | null;
  spicy: number | null;
  woody: number | null;
  body: number | null;
  updated_at: string;
};

type PriceRecord = {
  id: number;
  liquor_id: number;
  source: string;
  current_price: number | null;
  original_price: number | null;
  crawled_at: string;
};

function toPrice(r: PriceRecord): LiquorPrice {
  return {
    id: r.id,
    liquorId: r.liquor_id,
    source: r.source,
    currentPrice: r.current_price,
    originalPrice: r.original_price,
    crawledAt: r.crawled_at,
  };
}

export type LiquorListResult = {
  rows: LiquorRow[];
  total: number;
  page: number;
  pageSize: number;
};

/** 등록된 상품(liquor) 총 개수 — 대시보드 지표용. */
export async function getLiquorCount(): Promise<number> {
  const db = adminDb("liquor");
  const { count, error } = await db
    .from("liquor")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

/**
 * 전체 상품 상세 조회수 합계(liquor.view_count). 양주는 방문자 추적 테이블이 없어
 * GA 로 트래픽을 보므로, DB 로 볼 수 있는 참여 지표는 상품 조회수 합계다.
 * (view_count 컬럼/마이그레이션 미적용이면 0.)
 */
export async function getLiquorViewTotal(): Promise<number> {
  const db = adminDb("liquor");
  const { data, error } = await db
    .from("liquor")
    .select("view_count")
    .limit(10000);
  if (error || !data) return 0;
  return (data as { view_count: number | null }[]).reduce(
    (sum, r) => sum + (r.view_count ?? 0),
    0,
  );
}

/**
 * 사이트 방문자수(site_visit 행 수 — 세션당 1건). site_visit 테이블 미적용이면 0.
 * (SQL: whisky_app frontend/supabase/add_site_visit.sql)
 */
export async function getLiquorVisitTotal(): Promise<number> {
  const db = adminDb("liquor");
  const { count, error } = await db
    .from("site_visit")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

/**
 * 오늘(KST) 사이트 방문수 — site_visit.created_at 이 한국 오늘 00:00 이후인 행 수.
 * site_visit 테이블 미적용/오류면 0.
 */
export async function getLiquorVisitToday(now: Date = new Date()): Promise<number> {
  const db = adminDb("liquor");
  const { count, error } = await db
    .from("site_visit")
    .select("id", { count: "exact", head: true })
    .gte("created_at", seoulDayStartUtcIso(now));
  if (error) return 0;
  return count ?? 0;
}

/**
 * 상품 목록 — updated_at 내림차순 + 검색(product_name/normalized_name/brand ilike) +
 * 페이지네이션. 각 행에 최신 가격 1건을 붙인다.
 */
export async function getLiquorList(opts: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<LiquorListResult> {
  const db = adminDb("liquor");
  const pageSize = clamp(opts.pageSize ?? 30, 1, 100);
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db
    .from("liquor")
    .select(LIQUOR_COLUMNS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  const term = sanitizeLikeTerm(opts.q ?? "");
  if (term) {
    query = query.or(
      `product_name.ilike.%${term}%,normalized_name.ilike.%${term}%,brand.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;
  if (error || !data) return { rows: [], total: 0, page, pageSize };

  const records = data as LiquorRecord[];
  const ids = records.map((r) => r.id);
  const latestByLiquor = await getLatestPrices(ids);

  const rows: LiquorRow[] = records.map((r) => ({
    id: r.id,
    normalizedName: r.normalized_name,
    brand: r.brand,
    category: r.category,
    volumeMl: r.volume_ml,
    alcoholPercent: r.alcohol_percent,
    country: r.country,
    productCode: r.product_code,
    productName: r.product_name,
    productUrl: r.product_url,
    imageUrl: r.image_url,
    clazz: r.clazz,
    sweet: r.sweet,
    smoky: r.smoky,
    fruity: r.fruity,
    spicy: r.spicy,
    woody: r.woody,
    body: r.body,
    updatedAt: r.updated_at,
    latestPrice: latestByLiquor.get(r.id) ?? null,
  }));

  return { rows, total: count ?? rows.length, page, pageSize };
}

/** 주어진 liquor id 들에 대한 최신 가격 1건씩. */
async function getLatestPrices(
  ids: number[],
): Promise<Map<number, LiquorPrice>> {
  const out = new Map<number, LiquorPrice>();
  if (ids.length === 0) return out;

  const db = adminDb("liquor");
  const { data } = await db
    .from("liquor_price")
    .select("id, liquor_id, source, current_price, original_price, crawled_at")
    .in("liquor_id", ids);

  const grouped = new Map<number, LiquorPrice[]>();
  for (const rec of (data ?? []) as PriceRecord[]) {
    const p = toPrice(rec);
    const arr = grouped.get(p.liquorId);
    if (arr) arr.push(p);
    else grouped.set(p.liquorId, [p]);
  }
  for (const [liquorId, prices] of grouped) {
    const latest = pickLatestPrice(prices);
    if (latest) out.set(liquorId, latest);
  }
  return out;
}

/** 특정 상품의 판매처별 가격 이력(crawled_at 내림차순). */
export async function getLiquorPriceHistory(
  liquorId: number,
): Promise<LiquorPrice[]> {
  const db = adminDb("liquor");
  const { data, error } = await db
    .from("liquor_price")
    .select("id, liquor_id, source, current_price, original_price, crawled_at")
    .eq("liquor_id", liquorId)
    .order("crawled_at", { ascending: false });
  if (error || !data) return [];
  return (data as PriceRecord[]).map(toPrice);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}