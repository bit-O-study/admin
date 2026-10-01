"use server";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/features/admin/admin";
import { healthSessionDb } from "@/lib/supabase/admin-clients";

export async function saveCoaching(request: string, body: string, publish: boolean) {
  if (!(await isAdminUser())) return { error: "관리자 권한이 필요합니다." };
  if (typeof body !== "string" || body.trim().length > 12000 || (publish && !body.trim())) return { error: "답변은 1~12,000자로 입력해 주세요." };
  const db = await healthSessionDb();
  const { error } = await db.rpc("manual_coach_save", { p_request: request, p_body: body.trim(), p_publish: publish });
  if (error) return { error: "저장하지 못했습니다. 이미 전달한 요청인지 확인해 주세요." };
  revalidatePath("/admin/health/coaching");
  return { error: null };
}

export async function prepareCoaching(user: string, kind: string) {
  if (!(await isAdminUser())) return { error: "관리자 권한이 필요합니다." };
  if (!["recommendation", "habit-report"].includes(kind)) return { error: "종류를 확인해 주세요." };
  const db = await healthSessionDb();
  const { error } = await db.rpc("manual_coach_request", { p_kind: kind, p_question: "", p_request: crypto.randomUUID(), p_user: user });
  if (error) return { error: "준비하지 못했습니다. 구독 상태와 DB 설정을 확인해 주세요." };
  revalidatePath("/admin/health/coaching");
  return { error: null };
}
