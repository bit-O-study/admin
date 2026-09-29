"use server";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/features/admin/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchTrainerNotification } from "./messaging.server";

export type TrainerResult = { ok: boolean; message: string; link?: string };
export async function trainerAction(_previous: TrainerResult, form: FormData): Promise<TrainerResult> {
  if (!(await isAdminUser())) return { ok: false, message: "관리자만 변경할 수 있어요." };
  const text = (key: string) => String(form.get(key) ?? "");
  const intent = text("intent");
  if (intent === "retry") {
    try {
      const message = await dispatchTrainerNotification(text("notification"));
      revalidatePath("/admin/health/trainers");
      return { ok: true, message };
    } catch { return { ok: false, message: "발송 결과 확인이 필요해요. 발송 내역을 확인해 주세요." }; }
  }
  if (intent !== "approve" && intent !== "cancel") return { ok: false, message: "지원하지 않는 요청이에요." };
  const db = await createSupabaseServerClient();
  const { error } = await db.rpc("pt_admin_pass", {
    p_trainer: text("trainer"), p_start: text("start"), p_end: text("end"),
    p_seats: Number(text("seats")), p_active: intent === "approve",
  });
  if (error) return { ok: false, message: error.code === "P0001" ? error.message : "저장하지 못했어요. 입력 내용을 확인해 주세요." };
  revalidatePath("/admin/health/trainers");
  return { ok: true, message: "저장했어요." };
}
