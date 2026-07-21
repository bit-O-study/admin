/** 운동 카탈로그 최소 스냅샷 (id·name·부위) — 헬스앱 exercise-catalog.ts 에서 추출. */
export type AdminExercise = { id: string; name: string; part: string };

export const ADMIN_EXERCISES: AdminExercise[] = [
  {
    "id": "goblet-squat",
    "name": "고블릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "good-morning",
    "name": "굿모닝",
    "part": "lower"
  },
  {
    "id": "glute-bridge",
    "name": "글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "diamond-pushup",
    "name": "다이아몬드 푸시업",
    "part": "arm"
  },
  {
    "id": "dumbbell-pullover",
    "name": "덤벨 풀오버",
    "part": "chest"
  },
  {
    "id": "deadlift",
    "name": "데드리프트",
    "part": "back"
  },
  {
    "id": "donkey-calf-raise",
    "name": "동키 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "drag-curl",
    "name": "드래그 컬",
    "part": "arm"
  },
  {
    "id": "decline-press",
    "name": "디클라인 벤치프레스",
    "part": "chest"
  },
  {
    "id": "dips",
    "name": "딥스",
    "part": "chest"
  },
  {
    "id": "skull-crusher",
    "name": "라잉 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "lat-pulldown",
    "name": "랫풀다운",
    "part": "back"
  },
  {
    "id": "russian-twist",
    "name": "러시안 트위스트",
    "part": "core"
  },
  {
    "id": "lunge",
    "name": "런지",
    "part": "lower"
  },
  {
    "id": "leg-extension",
    "name": "레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "leg-curl",
    "name": "레그컬",
    "part": "lower"
  },
  {
    "id": "leg-press",
    "name": "레그프레스",
    "part": "lower"
  },
  {
    "id": "barbell-row",
    "name": "로우",
    "part": "back"
  },
  {
    "id": "low-row-machine",
    "name": "롱풀",
    "part": "back"
  },
  {
    "id": "rdl",
    "name": "루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "reverse-curl",
    "name": "리버스 컬",
    "part": "arm"
  },
  {
    "id": "reverse-crunch",
    "name": "리버스 크런치",
    "part": "core"
  },
  {
    "id": "reverse-pec-deck",
    "name": "리버스 펙덱",
    "part": "back"
  },
  {
    "id": "wrist-curl",
    "name": "리스트 컬",
    "part": "arm"
  },
  {
    "id": "rear-delt-fly",
    "name": "리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "mountain-climber",
    "name": "마운틴 클라이머",
    "part": "core"
  },
  {
    "id": "machine-rear-delt-fly",
    "name": "머신 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "machine-shoulder-press",
    "name": "머신 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "machine-chest-press",
    "name": "머신 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "meadows-row",
    "name": "메도우스 로우",
    "part": "back"
  },
  {
    "id": "biceps-curl",
    "name": "바이셉스 컬",
    "part": "arm"
  },
  {
    "id": "bicycle-crunch",
    "name": "바이시클 크런치",
    "part": "core"
  },
  {
    "id": "box-squat",
    "name": "박스 스쿼트",
    "part": "lower"
  },
  {
    "id": "bench-dip",
    "name": "벤치 딥",
    "part": "arm"
  },
  {
    "id": "bench-press",
    "name": "벤치프레스",
    "part": "chest"
  },
  {
    "id": "belt-squat",
    "name": "벨트 스쿼트",
    "part": "lower"
  },
  {
    "id": "bulgarian-split-squat",
    "name": "불가리안 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "v-up",
    "name": "브이업",
    "part": "core"
  },
  {
    "id": "lateral-raise",
    "name": "사이드 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "side-plank",
    "name": "사이드 플랭크",
    "part": "core"
  },
  {
    "id": "shrug",
    "name": "슈러그",
    "part": "back"
  },
  {
    "id": "sumo-deadlift",
    "name": "스모 데드리프트",
    "part": "lower"
  },
  {
    "id": "sumo-squat",
    "name": "스모 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-squat",
    "name": "스미스 머신 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-bench-press",
    "name": "스미스 벤치프레스",
    "part": "chest"
  },
  {
    "id": "squat",
    "name": "스쿼트",
    "part": "lower"
  },
  {
    "id": "standing-calf-raise",
    "name": "스탠딩 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "standing-cable-curl",
    "name": "스탠딩 케이블 컬",
    "part": "arm"
  },
  {
    "id": "step-up",
    "name": "스텝업",
    "part": "lower"
  },
  {
    "id": "straight-arm-pulldown",
    "name": "스트레이트암 풀다운",
    "part": "back"
  },
  {
    "id": "stiff-leg-deadlift",
    "name": "스티프 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "sissy-squat",
    "name": "시시 스쿼트",
    "part": "lower"
  },
  {
    "id": "seated-leg-curl",
    "name": "시티드 레그컬",
    "part": "lower"
  },
  {
    "id": "seated-calf-raise",
    "name": "시티드 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "seated-cable-row",
    "name": "시티드 케이블 로우",
    "part": "back"
  },
  {
    "id": "sit-up",
    "name": "싯업",
    "part": "core"
  },
  {
    "id": "single-leg-leg-press",
    "name": "싱글 레그프레스",
    "part": "lower"
  },
  {
    "id": "arnold-press",
    "name": "아놀드 프레스",
    "part": "shoulder"
  },
  {
    "id": "ab-rollout",
    "name": "앱 휠 롤아웃",
    "part": "core"
  },
  {
    "id": "assisted-pull-up",
    "name": "어시스티드 풀업 머신",
    "part": "back"
  },
  {
    "id": "upright-row",
    "name": "업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "overhead-triceps-extension",
    "name": "오버헤드 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "ohp",
    "name": "오버헤드프레스",
    "part": "shoulder"
  },
  {
    "id": "wide-grip-pull-up",
    "name": "와이드 그립 풀업",
    "part": "back"
  },
  {
    "id": "wood-chopper",
    "name": "우드 차퍼",
    "part": "core"
  },
  {
    "id": "walking-lunge",
    "name": "워킹 런지",
    "part": "lower"
  },
  {
    "id": "one-arm-dumbbell-row",
    "name": "원암 덤벨 로우",
    "part": "back"
  },
  {
    "id": "ez-bar-curl",
    "name": "이지바 컬",
    "part": "arm"
  },
  {
    "id": "inverted-row",
    "name": "인버티드 로우",
    "part": "back"
  },
  {
    "id": "incline-curl",
    "name": "인클라인 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "incline-cable-fly",
    "name": "인클라인 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "incline-press",
    "name": "인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "zottman-curl",
    "name": "조트만 컬",
    "part": "arm"
  },
  {
    "id": "chest-supported-row",
    "name": "체스트 서포티드 로우",
    "part": "back"
  },
  {
    "id": "chest-fly",
    "name": "체스트 플라이",
    "part": "chest"
  },
  {
    "id": "chin-up",
    "name": "친업",
    "part": "back"
  },
  {
    "id": "curtsy-lunge",
    "name": "커트시 런지",
    "part": "lower"
  },
  {
    "id": "concentration-curl",
    "name": "컨센트레이션 컬",
    "part": "arm"
  },
  {
    "id": "cable-rope-hammer-curl",
    "name": "케이블 로프 해머컬",
    "part": "arm"
  },
  {
    "id": "cable-rear-delt-fly",
    "name": "케이블 리어 델트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-lateral-raise",
    "name": "케이블 사이드 레터럴",
    "part": "shoulder"
  },
  {
    "id": "cable-curl",
    "name": "케이블 컬",
    "part": "arm"
  },
  {
    "id": "cable-crunch",
    "name": "케이블 크런치",
    "part": "core"
  },
  {
    "id": "cable-crossover",
    "name": "케이블 크로스오버",
    "part": "chest"
  },
  {
    "id": "cable-kickback",
    "name": "케이블 킥백",
    "part": "lower"
  },
  {
    "id": "cable-pull-through",
    "name": "케이블 풀스루",
    "part": "lower"
  },
  {
    "id": "cable-front-raise",
    "name": "케이블 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-fly",
    "name": "케이블 플라이",
    "part": "chest"
  },
  {
    "id": "cossack-squat",
    "name": "코삭 스쿼트",
    "part": "lower"
  },
  {
    "id": "crunch",
    "name": "크런치",
    "part": "core"
  },
  {
    "id": "close-grip-bench-press",
    "name": "클로즈그립 벤치프레스",
    "part": "chest"
  },
  {
    "id": "toes-to-bar",
    "name": "토스 투 바",
    "part": "core"
  },
  {
    "id": "triceps-kickback",
    "name": "트라이셉스 킥백",
    "part": "arm"
  },
  {
    "id": "triceps-pushdown",
    "name": "트라이셉스 푸시다운",
    "part": "arm"
  },
  {
    "id": "t-bar-row",
    "name": "티바 로우",
    "part": "back"
  },
  {
    "id": "pallof-press",
    "name": "팰로프 프레스",
    "part": "core"
  },
  {
    "id": "face-pull",
    "name": "페이스풀",
    "part": "shoulder"
  },
  {
    "id": "pec-deck",
    "name": "펙덱 플라이",
    "part": "chest"
  },
  {
    "id": "pendlay-row",
    "name": "펜들레이 로우",
    "part": "back"
  },
  {
    "id": "push-up",
    "name": "푸시업",
    "part": "chest"
  },
  {
    "id": "pull-up",
    "name": "풀업",
    "part": "back"
  },
  {
    "id": "front-raise",
    "name": "프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "front-squat",
    "name": "프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "preacher-curl",
    "name": "프리처 컬",
    "part": "arm"
  },
  {
    "id": "plank",
    "name": "플랭크",
    "part": "core"
  },
  {
    "id": "pistol-squat",
    "name": "피스톨 스쿼트",
    "part": "lower"
  },
  {
    "id": "hyperextension",
    "name": "하이퍼익스텐션",
    "part": "back"
  },
  {
    "id": "hollow-hold",
    "name": "할로우 홀드",
    "part": "core"
  },
  {
    "id": "hammer-curl",
    "name": "해머컬",
    "part": "arm"
  },
  {
    "id": "hack-squat",
    "name": "핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "hanging-leg-raise",
    "name": "행잉 레그레이즈",
    "part": "core"
  },
  {
    "id": "hip-thrust",
    "name": "힙 스러스트",
    "part": "lower"
  },
  {
    "id": "hip-adduction",
    "name": "힙 어덕션 (이너타이)",
    "part": "lower"
  },
  {
    "id": "hip-abduction",
    "name": "힙 어브덕션 (아웃타이)",
    "part": "lower"
  }
];

const BY_ID = new Map(ADMIN_EXERCISES.map((e) => [e.id, e]));
export function getAdminExercise(id: string): AdminExercise | undefined {
  return BY_ID.get(id);
}
