import { redirect } from "next/navigation";
import { isAdminUser } from "@/features/admin/admin";
import { healthSessionDb } from "@/lib/supabase/admin-clients";
import { CoachingPanel, type CoachingRow, type CoachingMember } from "@/features/health/coaching-panel";

export default async function CoachingPage() {
  if (!(await isAdminUser())) redirect("/admin");
  const db = await healthSessionDb();
  const fields = "id,user_id,kind,for_date,question,context,answer";
  const [pending, answered, members] = await Promise.all([
    db.from("manual_coach_requests").select(fields).is("answered_at", null).order("created_at").limit(100),
    db.from("manual_coach_requests").select(fields).not("answered_at", "is", null).order("answered_at", { ascending: false }).limit(30),
    db.rpc("manual_coach_members"),
  ]);
  const rows = [...(pending.data || []), ...(answered.data || [])];
  const drafts = rows.length ? await db.from("manual_coach_drafts").select("request_id,body").in("request_id", rows.map(r => r.id)) : { data: [], error: null };
  if (pending.error || answered.error || members.error || drafts.error) return <p role="alert">코칭 데이터를 불러오지 못했습니다. DB 마이그레이션과 관리자 권한을 확인해 주세요.</p>;
  const draftMap = new Map((drafts.data || []).map(d => [d.request_id, d.body]));
  return <main className="space-y-5 p-4"><h1 className="text-2xl font-bold">짐꾼 코칭</h1><CoachingPanel rows={rows.map(r => ({ ...r, draft: draftMap.get(r.id) || "" })) as CoachingRow[]} members={(members.data || []) as CoachingMember[]} /></main>;
}
