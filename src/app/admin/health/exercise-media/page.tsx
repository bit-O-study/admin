import { ADMIN_EXERCISES } from "@/features/health/exercise-catalog";
import { getAllExerciseMedia } from "@/features/health/exercise-media";
import { AdminMediaManager } from "@/features/health/components/admin-media-manager";

export const dynamic = "force-dynamic";

const PART_LABEL: Record<string, string> = {
  chest: "가슴",
  back: "등",
  shoulder: "어깨",
  arm: "팔",
  lower: "하체",
  core: "코어",
};

export default async function HealthExerciseMediaPage() {
  const media = await getAllExerciseMedia();
  const exercises = ADMIN_EXERCISES.map((e) => ({
    id: e.id,
    name: e.name,
    part: PART_LABEL[e.part] ?? e.part,
  }));

  return (
    <div>
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">
          운동 미디어 관리
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          운동별 시범 영상/움짤 URL 을 등록하면 헬스앱의 운동 상세·가이드 화면에
          표시됩니다. 유튜브/Vimeo 링크 또는 mp4/gif/이미지 URL 을 넣으세요.
        </p>
      </div>
      <AdminMediaManager exercises={exercises} initialMedia={media} />
    </div>
  );
}