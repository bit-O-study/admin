import "server-only";
import { isAdminUser } from "@/features/admin/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export type ReviewState = "pending" | "reviewed" | "hold";
export type LibraryFile = { id: string; spaceId: string; projectName: string; name: string; kind: string; size: number; sha256: string; versionLabel: string; description: string; createdAt: string; uploaderName: string | null; uploaderEmail: string | null; status: ReviewState; reviewNote: string; reviewerEmail: string | null; reviewedAt: string | null };
export type LibraryData = { files: LibraryFile[]; projects: { id: string; name: string }[]; counts: { total: number; pending: number; reviewed: number; hold: number }; page: number; hasNext: boolean; storageReady: boolean };
export const memoOrigin = process.env.MEMO_APP_URL || "https://meeting-minutes-orcin.vercel.app";
export async function libraryRequest(query = "", body?: unknown) {
  if (!(await isAdminUser())) throw new Error("관리자 권한이 필요합니다.");
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("다시 로그인해 주세요.");
  return fetch(new URL("/api/admin/library" + query, memoOrigin), { method: body === undefined ? "GET" : "POST", headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(20000) });
}
