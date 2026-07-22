"use server";

import { adminDb } from "@/lib/supabase/admin-clients";
import { isAdminUser } from "@/features/admin/admin";
import {
  getLiquorList,
  getLiquorPriceHistory,
  type LiquorListResult,
} from "@/features/liquor/data";
import {
  validateLiquorPatch,
  type LiquorPatch,
  type LiquorPrice,
} from "@/features/liquor/liquor";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/** 상품 편집/추가 폼 입력(문자열 위주). */
export type LiquorFormInput = {
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
};

/** 검증된 패치 → liquor 테이블 컬럼 매핑(insert/update 공용). */
function toLiquorRow(p: LiquorPatch): Record<string, unknown> {
  return {
    product_name: p.productName,
    normalized_name: p.normalizedName,
    brand: p.brand,
    category: p.category,
    country: p.country,
    volume_ml: p.volumeMl,
    alcohol_percent: p.alcoholPercent,
    product_url: p.productUrl,
    image_url: p.imageUrl,
    class: p.clazz,
    sweet: p.sweet,
    smoky: p.smoky,
    fruity: p.fruity,
    spicy: p.spicy,
    woody: p.woody,
    body: p.body,
  };
}

/** 이미지 저장 버킷(양주 Supabase). env 로 덮어쓸 수 있음. */
const IMAGE_BUCKET =
  process.env.LIQUOR_SUPABASE_STORAGE_BUCKET ?? "whisky-images";

/** 목록 검색/페이지 이동(클라이언트에서 호출). */
export async function searchLiquorAction(input: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<LiquorListResult>> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 접근할 수 있습니다." };
  }
  const data = await getLiquorList(input);
  return { ok: true, data };
}

/** 특정 상품의 가격 이력 조회(행 펼칠 때). */
export async function priceHistoryAction(
  liquorId: number,
): Promise<ActionResult<LiquorPrice[]>> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 접근할 수 있습니다." };
  }
  if (!Number.isInteger(liquorId)) {
    return { ok: false, error: "잘못된 상품 ID 입니다." };
  }
  const data = await getLiquorPriceHistory(liquorId);
  return { ok: true, data };
}

/** 상품 정보 수정. */
export async function updateLiquorAction(
  id: number,
  input: LiquorFormInput,
): Promise<ActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 수정할 수 있습니다." };
  }
  if (!Number.isInteger(id)) {
    return { ok: false, error: "잘못된 상품 ID 입니다." };
  }

  const validated = validateLiquorPatch(input);
  if (!validated.ok) return { ok: false, error: validated.error };

  const db = adminDb("liquor");
  const { error } = await db
    .from("liquor")
    .update(toLiquorRow(validated.patch))
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** 상품 수동 추가(신규 등록). */
export async function insertLiquorAction(
  input: LiquorFormInput,
): Promise<ActionResult<{ id: number }>> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 추가할 수 있습니다." };
  }
  const validated = validateLiquorPatch(input);
  if (!validated.ok) return { ok: false, error: validated.error };

  const db = adminDb("liquor");
  const { data, error } = await db
    .from("liquor")
    .insert(toLiquorRow(validated.patch))
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: number }).id } };
}

/**
 * 상품 이미지 업로드 → 스토리지 버킷에 저장하고 공개 URL 반환.
 * FormData 로 File 을 받는다(서버 액션). 반환된 URL 을 image_url 로 저장하면 된다.
 */
export async function uploadLiquorImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 업로드할 수 있습니다." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "이미지 파일이 없습니다." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "이미지 파일만 업로드할 수 있습니다." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "이미지는 5MB 이하만 가능합니다." };
  }

  const ext = (file.name.split(".").pop() ?? "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5) || "jpg";
  // 파일명은 서버에서 생성(사용자 입력 미신뢰). 시간 대신 크기+타입 기반 안정 키.
  const path = `manual/${file.size}-${file.type.replace(/[^a-z0-9]/gi, "")}.${ext}`;

  const db = adminDb("liquor");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await db.storage
    .from(IMAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });
  if (upErr) return { ok: false, error: upErr.message };

  const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { ok: true, data: { url: data.publicUrl } };
}

/** 상품 삭제(연결된 가격은 FK on delete cascade 로 함께 삭제됨). */
export async function deleteLiquorAction(id: number): Promise<ActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 삭제할 수 있습니다." };
  }
  if (!Number.isInteger(id)) {
    return { ok: false, error: "잘못된 상품 ID 입니다." };
  }
  const db = adminDb("liquor");
  const { error } = await db.from("liquor").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** 특정 판매처 가격(liquor_price) 1행 삭제. */
export async function deleteLiquorPriceAction(
  priceId: number,
): Promise<ActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 삭제할 수 있습니다." };
  }
  if (!Number.isInteger(priceId)) {
    return { ok: false, error: "잘못된 가격 ID 입니다." };
  }
  const db = adminDb("liquor");
  const { error } = await db.from("liquor_price").delete().eq("id", priceId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}