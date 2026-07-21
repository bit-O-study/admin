import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_GROUP_MODE,
  isGroupMode,
  type GroupMode,
} from "@/features/health/group-mode";

/** 현재 그룹탭 전역 모드 — group_mode() RPC. 오류/미설정이면 기본('gym'). */
export async function getGroupMode(): Promise<GroupMode> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("group_mode");
  if (error || !isGroupMode(data)) return DEFAULT_GROUP_MODE;
  return data;
}