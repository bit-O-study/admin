"use server";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/features/admin/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchTrainerNotification } from "./messaging.server";
import { normalizePhone } from "./types";

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
  if (intent === "grant") {
    // 신청 없이 바로 지급 — 신청 행이 없어도 만든다(pt_admin_pass 는 신청 행이 있어야 한다).
    const name = text("name").trim();
    const phone = normalizePhone(text("phone"));
    if (!text("trainer")) return { ok: false, message: "회원을 선택해 주세요." };
    if (!name || name.length > 80 || !phone) return { ok: false, message: "이름과 휴대폰 번호를 확인해 주세요." };
    const db = await createSupabaseServerClient();
    const { error } = await db.rpc("pt_admin_grant_pass", {
      p_trainer: text("trainer"), p_name: name, p_phone: phone,
      p_start: text("start"), p_end: text("end"), p_seats: Number(text("seats")),
    });
    if (error) return { ok: false, message: error.code === "P0001" ? error.message : "지급하지 못했어요. 입력 내용을 확인해 주세요." };
    revalidatePath("/admin/health/grants");
    revalidatePath("/admin/health/trainers");
    return { ok: true, message: "이용권을 지급했어요. 기간 변경·해지는 트레이너 이용권 메뉴에서 하세요." };
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
