import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MediaKind = "video" | "gif" | "image";

export type ExerciseMedia = {
  exerciseId: string;
  url: string;
  kind: MediaKind;
};

function toKind(v: unknown): MediaKind {
  return v === "gif" || v === "image" ? v : "video";
}

/** 등록된 모든 운동 미디어(관리자). */
export async function getAllExerciseMedia(): Promise<ExerciseMedia[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("exercise_media")
    .select("exercise_id, url, kind");
  if (error || !data) return [];
  return (data as { exercise_id: string; url: string; kind: unknown }[]).map(
    (r) => ({ exerciseId: r.exercise_id, url: r.url, kind: toKind(r.kind) }),
  );
}