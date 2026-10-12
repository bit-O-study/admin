/** 운동 카탈로그 최소 스냅샷 (id·name·부위) — 헬스앱 exercise-catalog.ts 에서 추출. */
export type AdminExercise = { id: string; name: string; part: string };

export const ADMIN_EXERCISES: AdminExercise[] = [
  {
    "id": "bench-press",
    "name": "벤치프레스",
    "part": "chest"
  },
  {
    "id": "incline-press",
    "name": "인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "chest-fly",
    "name": "체스트 플라이",
    "part": "chest"
  },
  {
    "id": "dips",
    "name": "딥스",
    "part": "chest"
  },
  {
    "id": "deadlift",
    "name": "데드리프트",
    "part": "back"
  },
  {
    "id": "barbell-row",
    "name": "로우",
    "part": "back"
  },
  {
    "id": "lat-pulldown",
    "name": "랫풀다운",
    "part": "back"
  },
  {
    "id": "pull-up",
    "name": "풀업",
    "part": "back"
  },
  {
    "id": "ohp",
    "name": "오버헤드프레스",
    "part": "shoulder"
  },
  {
    "id": "lateral-raise",
    "name": "사이드 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "face-pull",
    "name": "페이스풀",
    "part": "shoulder"
  },
  {
    "id": "biceps-curl",
    "name": "바이셉스 컬",
    "part": "arm"
  },
  {
    "id": "hammer-curl",
    "name": "해머컬",
    "part": "arm"
  },
  {
    "id": "triceps-pushdown",
    "name": "트라이셉스 푸시다운",
    "part": "arm"
  },
  {
    "id": "squat",
    "name": "스쿼트",
    "part": "lower"
  },
  {
    "id": "leg-press",
    "name": "레그프레스",
    "part": "lower"
  },
  {
    "id": "rdl",
    "name": "루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "leg-curl",
    "name": "레그컬",
    "part": "lower"
  },
  {
    "id": "plank",
    "name": "플랭크",
    "part": "core"
  },
  {
    "id": "hanging-leg-raise",
    "name": "행잉 레그레이즈",
    "part": "core"
  },
  {
    "id": "cable-crunch",
    "name": "케이블 크런치",
    "part": "core"
  },
  {
    "id": "hip-thrust",
    "name": "힙 스러스트",
    "part": "lower"
  },
  {
    "id": "glute-bridge",
    "name": "글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "lunge",
    "name": "런지",
    "part": "lower"
  },
  {
    "id": "bulgarian-split-squat",
    "name": "불가리안 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "cable-kickback",
    "name": "케이블 킥백",
    "part": "lower"
  },
  {
    "id": "hip-abduction",
    "name": "힙 어브덕션 (아웃타이)",
    "part": "lower"
  },
  {
    "id": "decline-press",
    "name": "디클라인 벤치프레스",
    "part": "chest"
  },
  {
    "id": "push-up",
    "name": "푸시업",
    "part": "chest"
  },
  {
    "id": "pec-deck",
    "name": "펙덱 플라이",
    "part": "chest"
  },
  {
    "id": "cable-crossover",
    "name": "케이블 크로스오버",
    "part": "chest"
  },
  {
    "id": "close-grip-bench-press",
    "name": "클로즈그립 벤치프레스",
    "part": "chest"
  },
  {
    "id": "t-bar-row",
    "name": "티바 로우",
    "part": "back"
  },
  {
    "id": "seated-cable-row",
    "name": "시티드 케이블 로우",
    "part": "back"
  },
  {
    "id": "one-arm-dumbbell-row",
    "name": "원암 덤벨 로우",
    "part": "back"
  },
  {
    "id": "straight-arm-pulldown",
    "name": "스트레이트암 풀다운",
    "part": "back"
  },
  {
    "id": "shrug",
    "name": "슈러그",
    "part": "back"
  },
  {
    "id": "chin-up",
    "name": "친업",
    "part": "back"
  },
  {
    "id": "hyperextension",
    "name": "하이퍼익스텐션",
    "part": "back"
  },
  {
    "id": "arnold-press",
    "name": "아놀드 프레스",
    "part": "shoulder"
  },
  {
    "id": "front-raise",
    "name": "프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "rear-delt-fly",
    "name": "리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "upright-row",
    "name": "업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "preacher-curl",
    "name": "프리처 컬",
    "part": "arm"
  },
  {
    "id": "ez-bar-curl",
    "name": "이지바 컬",
    "part": "arm"
  },
  {
    "id": "incline-curl",
    "name": "인클라인 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "concentration-curl",
    "name": "컨센트레이션 컬",
    "part": "arm"
  },
  {
    "id": "skull-crusher",
    "name": "라잉 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "overhead-triceps-extension",
    "name": "오버헤드 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "bench-dip",
    "name": "벤치 딥",
    "part": "arm"
  },
  {
    "id": "reverse-curl",
    "name": "리버스 컬",
    "part": "arm"
  },
  {
    "id": "wrist-curl",
    "name": "리스트 컬",
    "part": "arm"
  },
  {
    "id": "front-squat",
    "name": "프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "goblet-squat",
    "name": "고블릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "hack-squat",
    "name": "핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "leg-extension",
    "name": "레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "seated-leg-curl",
    "name": "시티드 레그컬",
    "part": "lower"
  },
  {
    "id": "standing-calf-raise",
    "name": "스탠딩 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "seated-calf-raise",
    "name": "시티드 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "sumo-deadlift",
    "name": "스모 데드리프트",
    "part": "lower"
  },
  {
    "id": "good-morning",
    "name": "굿모닝",
    "part": "lower"
  },
  {
    "id": "step-up",
    "name": "스텝업",
    "part": "lower"
  },
  {
    "id": "hip-adduction",
    "name": "힙 어덕션 (이너타이)",
    "part": "lower"
  },
  {
    "id": "walking-lunge",
    "name": "워킹 런지",
    "part": "lower"
  },
  {
    "id": "smith-squat",
    "name": "스미스 머신 스쿼트",
    "part": "lower"
  },
  {
    "id": "sit-up",
    "name": "싯업",
    "part": "core"
  },
  {
    "id": "crunch",
    "name": "크런치",
    "part": "core"
  },
  {
    "id": "side-plank",
    "name": "사이드 플랭크",
    "part": "core"
  },
  {
    "id": "russian-twist",
    "name": "러시안 트위스트",
    "part": "core"
  },
  {
    "id": "ab-rollout",
    "name": "앱 휠 롤아웃",
    "part": "core"
  },
  {
    "id": "mountain-climber",
    "name": "마운틴 클라이머",
    "part": "core"
  },
  {
    "id": "wood-chopper",
    "name": "우드 차퍼",
    "part": "core"
  },
  {
    "id": "pallof-press",
    "name": "팰로프 프레스",
    "part": "core"
  },
  {
    "id": "smith-bench-press",
    "name": "스미스 벤치프레스",
    "part": "chest"
  },
  {
    "id": "machine-chest-press",
    "name": "머신 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "incline-cable-fly",
    "name": "인클라인 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "dumbbell-pullover",
    "name": "덤벨 풀오버",
    "part": "chest"
  },
  {
    "id": "pendlay-row",
    "name": "펜들레이 로우",
    "part": "back"
  },
  {
    "id": "meadows-row",
    "name": "메도우스 로우",
    "part": "back"
  },
  {
    "id": "reverse-pec-deck",
    "name": "리버스 펙덱",
    "part": "back"
  },
  {
    "id": "inverted-row",
    "name": "인버티드 로우",
    "part": "back"
  },
  {
    "id": "wide-grip-pull-up",
    "name": "와이드 그립 풀업",
    "part": "back"
  },
  {
    "id": "cable-lateral-raise",
    "name": "케이블 사이드 레터럴",
    "part": "shoulder"
  },
  {
    "id": "machine-shoulder-press",
    "name": "머신 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "machine-rear-delt-fly",
    "name": "머신 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "cable-rear-delt-fly",
    "name": "케이블 리어 델트 레이즈",
    "part": "shoulder"
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
    "id": "cable-curl",
    "name": "케이블 컬",
    "part": "arm"
  },
  {
    "id": "drag-curl",
    "name": "드래그 컬",
    "part": "arm"
  },
  {
    "id": "zottman-curl",
    "name": "조트만 컬",
    "part": "arm"
  },
  {
    "id": "cable-rope-hammer-curl",
    "name": "케이블 로프 해머컬",
    "part": "arm"
  },
  {
    "id": "triceps-kickback",
    "name": "트라이셉스 킥백",
    "part": "arm"
  },
  {
    "id": "diamond-pushup",
    "name": "다이아몬드 푸시업",
    "part": "arm"
  },
  {
    "id": "stiff-leg-deadlift",
    "name": "스티프 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "pistol-squat",
    "name": "피스톨 스쿼트",
    "part": "lower"
  },
  {
    "id": "sissy-squat",
    "name": "시시 스쿼트",
    "part": "lower"
  },
  {
    "id": "cossack-squat",
    "name": "코삭 스쿼트",
    "part": "lower"
  },
  {
    "id": "box-squat",
    "name": "박스 스쿼트",
    "part": "lower"
  },
  {
    "id": "belt-squat",
    "name": "벨트 스쿼트",
    "part": "lower"
  },
  {
    "id": "single-leg-leg-press",
    "name": "싱글 레그프레스",
    "part": "lower"
  },
  {
    "id": "curtsy-lunge",
    "name": "커트시 런지",
    "part": "lower"
  },
  {
    "id": "sumo-squat",
    "name": "스모 스쿼트",
    "part": "lower"
  },
  {
    "id": "donkey-calf-raise",
    "name": "동키 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "reverse-crunch",
    "name": "리버스 크런치",
    "part": "core"
  },
  {
    "id": "v-up",
    "name": "브이업",
    "part": "core"
  },
  {
    "id": "hollow-hold",
    "name": "할로우 홀드",
    "part": "core"
  },
  {
    "id": "toes-to-bar",
    "name": "토스 투 바",
    "part": "core"
  },
  {
    "id": "bicycle-crunch",
    "name": "바이시클 크런치",
    "part": "core"
  },
  {
    "id": "low-row-machine",
    "name": "롱풀",
    "part": "back"
  },
  {
    "id": "chest-supported-row",
    "name": "체스트 서포티드 로우",
    "part": "back"
  },
  {
    "id": "assisted-pull-up",
    "name": "어시스티드 풀업 머신",
    "part": "back"
  },
  {
    "id": "standing-cable-curl",
    "name": "스탠딩 케이블 컬",
    "part": "arm"
  },
  {
    "id": "cable-pull-through",
    "name": "케이블 풀스루",
    "part": "lower"
  },
  {
    "id": "barbell-bench-press",
    "name": "바벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "incline-barbell-bench-press",
    "name": "인클라인 바벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "decline-barbell-bench-press",
    "name": "디클라인 바벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "dumbbell-bench-press",
    "name": "덤벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "incline-dumbbell-bench-press",
    "name": "인클라인 덤벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "decline-dumbbell-bench-press",
    "name": "디클라인 덤벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "dumbbell-fly",
    "name": "덤벨 플라이",
    "part": "chest"
  },
  {
    "id": "incline-dumbbell-fly",
    "name": "인클라인 덤벨 플라이",
    "part": "chest"
  },
  {
    "id": "low-cable-fly",
    "name": "로우 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "smith-machine-bench-press",
    "name": "스미스 머신 벤치프레스",
    "part": "chest"
  },
  {
    "id": "incline-push-up",
    "name": "인클라인 푸시업",
    "part": "chest"
  },
  {
    "id": "decline-push-up",
    "name": "디클라인 푸시업",
    "part": "chest"
  },
  {
    "id": "chest-dip",
    "name": "체스트 딥스",
    "part": "chest"
  },
  {
    "id": "svend-press",
    "name": "스벤드 프레스",
    "part": "chest"
  },
  {
    "id": "floor-press",
    "name": "플로어 프레스",
    "part": "chest"
  },
  {
    "id": "conventional-deadlift",
    "name": "컨벤셔널 데드리프트",
    "part": "back"
  },
  {
    "id": "barbell-bent-over-row",
    "name": "바벨 벤트오버 로우",
    "part": "back"
  },
  {
    "id": "lat-pulldown-2",
    "name": "랫 풀다운",
    "part": "back"
  },
  {
    "id": "wide-grip-lat-pulldown",
    "name": "와이드 그립 랫 풀다운",
    "part": "back"
  },
  {
    "id": "close-grip-lat-pulldown",
    "name": "클로즈 그립 랫 풀다운",
    "part": "back"
  },
  {
    "id": "assisted-pull-up-2",
    "name": "어시스트 풀업",
    "part": "back"
  },
  {
    "id": "straight-arm-pulldown-2",
    "name": "스트레이트 암 풀다운",
    "part": "back"
  },
  {
    "id": "machine-row",
    "name": "머신 로우",
    "part": "back"
  },
  {
    "id": "hammer-strength-high-row",
    "name": "하이 로우 머신",
    "part": "back"
  },
  {
    "id": "rack-pull",
    "name": "랙풀",
    "part": "back"
  },
  {
    "id": "back-extension",
    "name": "백 익스텐션",
    "part": "back"
  },
  {
    "id": "barbell-shrug",
    "name": "바벨 슈러그",
    "part": "back"
  },
  {
    "id": "dumbbell-shrug",
    "name": "덤벨 슈러그",
    "part": "back"
  },
  {
    "id": "meadows-row-2",
    "name": "미도우즈 로우",
    "part": "back"
  },
  {
    "id": "seal-row",
    "name": "실 로우",
    "part": "back"
  },
  {
    "id": "landmine-row",
    "name": "랜드마인 로우",
    "part": "back"
  },
  {
    "id": "barbell-overhead-press",
    "name": "바벨 오버헤드 프레스",
    "part": "shoulder"
  },
  {
    "id": "military-press",
    "name": "밀리터리 프레스",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-shoulder-press",
    "name": "덤벨 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "smith-machine-shoulder-press",
    "name": "스미스 머신 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "behind-the-neck-press",
    "name": "비하인드 넥 프레스",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-lateral-raise",
    "name": "덤벨 사이드 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-lateral-raise-2",
    "name": "케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "machine-lateral-raise",
    "name": "머신 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-front-raise",
    "name": "덤벨 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-rear-delt-fly",
    "name": "덤벨 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "cable-rear-delt-fly-2",
    "name": "케이블 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "face-pull-2",
    "name": "페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "barbell-upright-row",
    "name": "바벨 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "cable-upright-row",
    "name": "케이블 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "landmine-press",
    "name": "랜드마인 프레스",
    "part": "shoulder"
  },
  {
    "id": "plate-front-raise",
    "name": "플레이트 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "barbell-back-squat",
    "name": "바벨 백 스쿼트",
    "part": "lower"
  },
  {
    "id": "high-bar-squat",
    "name": "하이바 스쿼트",
    "part": "lower"
  },
  {
    "id": "low-bar-squat",
    "name": "로우바 스쿼트",
    "part": "lower"
  },
  {
    "id": "leg-press-2",
    "name": "레그 프레스",
    "part": "lower"
  },
  {
    "id": "lying-leg-curl",
    "name": "라잉 레그 컬",
    "part": "lower"
  },
  {
    "id": "seated-leg-curl-2",
    "name": "시티드 레그 컬",
    "part": "lower"
  },
  {
    "id": "dumbbell-lunge",
    "name": "덤벨 런지",
    "part": "lower"
  },
  {
    "id": "barbell-hip-thrust",
    "name": "바벨 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "cable-glute-kickback",
    "name": "케이블 글루트 킥백",
    "part": "lower"
  },
  {
    "id": "hip-abduction-machine",
    "name": "힙 어브덕션 머신",
    "part": "lower"
  },
  {
    "id": "hip-adduction-machine",
    "name": "힙 어덕션 머신",
    "part": "lower"
  },
  {
    "id": "leg-press-calf-raise",
    "name": "레그 프레스 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "curtsy-lunge-2",
    "name": "컷시 런지",
    "part": "lower"
  },
  {
    "id": "nordic-hamstring-curl",
    "name": "노르딕 햄스트링 컬",
    "part": "lower"
  },
  {
    "id": "glute-ham-raise",
    "name": "글루트 햄 레이즈",
    "part": "lower"
  },
  {
    "id": "jump-squat",
    "name": "점프 스쿼트",
    "part": "lower"
  },
  {
    "id": "barbell-curl",
    "name": "바벨 컬",
    "part": "arm"
  },
  {
    "id": "ez-bar-curl-2",
    "name": "EZ바 컬",
    "part": "arm"
  },
  {
    "id": "dumbbell-biceps-curl",
    "name": "덤벨 컬",
    "part": "arm"
  },
  {
    "id": "hammer-curl-2",
    "name": "해머 컬",
    "part": "arm"
  },
  {
    "id": "machine-preacher-curl",
    "name": "머신 프리처 컬",
    "part": "arm"
  },
  {
    "id": "cable-rope-hammer-curl-2",
    "name": "케이블 로프 해머 컬",
    "part": "arm"
  },
  {
    "id": "spider-curl",
    "name": "스파이더 컬",
    "part": "arm"
  },
  {
    "id": "zottman-curl-2",
    "name": "졸트만 컬",
    "part": "arm"
  },
  {
    "id": "21s-barbell-curl",
    "name": "21s 바벨 컬",
    "part": "arm"
  },
  {
    "id": "reverse-barbell-curl",
    "name": "리버스 바벨 컬",
    "part": "arm"
  },
  {
    "id": "close-grip-bench-press-2",
    "name": "클로즈 그립 벤치프레스",
    "part": "arm"
  },
  {
    "id": "lying-triceps-extension",
    "name": "스컬크러셔",
    "part": "arm"
  },
  {
    "id": "ez-bar-skull-crusher",
    "name": "EZ바 스컬크러셔",
    "part": "arm"
  },
  {
    "id": "dumbbell-overhead-extension",
    "name": "덤벨 오버헤드 익스텐션",
    "part": "arm"
  },
  {
    "id": "triceps-pushdown-2",
    "name": "케이블 푸시다운",
    "part": "arm"
  },
  {
    "id": "rope-triceps-pushdown",
    "name": "로프 푸시다운",
    "part": "arm"
  },
  {
    "id": "reverse-grip-pushdown",
    "name": "리버스 그립 푸시다운",
    "part": "arm"
  },
  {
    "id": "bench-dip-2",
    "name": "벤치 딥스",
    "part": "arm"
  },
  {
    "id": "triceps-dip",
    "name": "트라이셉스 딥스",
    "part": "arm"
  },
  {
    "id": "jm-press",
    "name": "JM 프레스",
    "part": "arm"
  },
  {
    "id": "machine-triceps-extension",
    "name": "머신 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "cable-overhead-triceps-extension",
    "name": "케이블 오버헤드 익스텐션",
    "part": "arm"
  },
  {
    "id": "reverse-wrist-curl",
    "name": "리버스 리스트 컬",
    "part": "arm"
  },
  {
    "id": "behind-the-back-wrist-curl",
    "name": "비하인드 백 리스트 컬",
    "part": "arm"
  },
  {
    "id": "farmer-s-carry",
    "name": "파머스 캐리",
    "part": "arm"
  },
  {
    "id": "plate-pinch",
    "name": "플레이트 핀치",
    "part": "arm"
  },
  {
    "id": "wrist-roller",
    "name": "리스트 롤러",
    "part": "arm"
  },
  {
    "id": "decline-sit-up",
    "name": "디클라인 싯업",
    "part": "core"
  },
  {
    "id": "hanging-leg-raise-2",
    "name": "행잉 레그 레이즈",
    "part": "core"
  },
  {
    "id": "hanging-knee-raise",
    "name": "행잉 니 레이즈",
    "part": "core"
  },
  {
    "id": "toes-to-bar-2",
    "name": "토즈 투 바",
    "part": "core"
  },
  {
    "id": "cable-woodchopper",
    "name": "케이블 우드 찹",
    "part": "core"
  },
  {
    "id": "pallof-press-2",
    "name": "팔로프 프레스",
    "part": "core"
  },
  {
    "id": "v-up-2",
    "name": "V업",
    "part": "core"
  },
  {
    "id": "hollow-body-hold",
    "name": "할로우 바디 홀드",
    "part": "core"
  },
  {
    "id": "dead-bug",
    "name": "데드버그",
    "part": "core"
  },
  {
    "id": "bird-dog",
    "name": "버드독",
    "part": "core"
  },
  {
    "id": "dragon-flag",
    "name": "드래곤 플래그",
    "part": "core"
  },
  {
    "id": "captain-s-chair-leg-raise",
    "name": "캡틴스 체어 레그 레이즈",
    "part": "core"
  },
  {
    "id": "kettlebell-swing",
    "name": "케틀벨 스윙",
    "part": "core"
  },
  {
    "id": "kettlebell-goblet-squat",
    "name": "케틀벨 고블릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "kettlebell-clean",
    "name": "케틀벨 클린",
    "part": "core"
  },
  {
    "id": "kettlebell-snatch",
    "name": "케틀벨 스내치",
    "part": "core"
  },
  {
    "id": "turkish-get-up",
    "name": "터키시 겟업",
    "part": "core"
  },
  {
    "id": "kettlebell-press",
    "name": "케틀벨 프레스",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-windmill",
    "name": "케틀벨 윈드밀",
    "part": "core"
  },
  {
    "id": "kettlebell-deadlift",
    "name": "케틀벨 데드리프트",
    "part": "lower"
  },
  {
    "id": "kettlebell-front-squat",
    "name": "케틀벨 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "kettlebell-row",
    "name": "케틀벨 로우",
    "part": "back"
  },
  {
    "id": "trx-row",
    "name": "TRX 로우",
    "part": "back"
  },
  {
    "id": "trx-push-up",
    "name": "TRX 푸시업",
    "part": "chest"
  },
  {
    "id": "trx-pike",
    "name": "TRX 파이크",
    "part": "core"
  },
  {
    "id": "trx-biceps-curl",
    "name": "TRX 비셉스 컬",
    "part": "arm"
  },
  {
    "id": "trx-triceps-extension",
    "name": "TRX 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "trx-lunge",
    "name": "TRX 런지",
    "part": "lower"
  },
  {
    "id": "trx-hamstring-curl",
    "name": "TRX 햄스트링 컬",
    "part": "lower"
  },
  {
    "id": "trx-chest-press",
    "name": "TRX 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "band-pull-apart",
    "name": "밴드 풀어파트",
    "part": "shoulder"
  },
  {
    "id": "band-lateral-raise",
    "name": "밴드 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "band-biceps-curl",
    "name": "밴드 비셉스 컬",
    "part": "arm"
  },
  {
    "id": "band-triceps-pushdown",
    "name": "밴드 트라이셉스 푸시다운",
    "part": "arm"
  },
  {
    "id": "band-face-pull",
    "name": "밴드 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "band-good-morning",
    "name": "밴드 굿모닝",
    "part": "back"
  },
  {
    "id": "band-monster-walk",
    "name": "밴드 몬스터 워크",
    "part": "lower"
  },
  {
    "id": "band-glute-bridge",
    "name": "밴드 글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "medicine-ball-slam",
    "name": "메디신볼 슬램",
    "part": "core"
  },
  {
    "id": "medicine-ball-chest-pass",
    "name": "메디신볼 체스트 패스",
    "part": "chest"
  },
  {
    "id": "medicine-ball-russian-twist",
    "name": "메디신볼 러시안 트위스트",
    "part": "core"
  },
  {
    "id": "wall-ball",
    "name": "월 볼",
    "part": "core"
  },
  {
    "id": "battle-rope-wave",
    "name": "배틀로프 웨이브",
    "part": "core"
  },
  {
    "id": "sled-push",
    "name": "슬레드 푸시",
    "part": "lower"
  },
  {
    "id": "sled-pull",
    "name": "슬레드 풀",
    "part": "lower"
  },
  {
    "id": "bosu-squat",
    "name": "보수 스쿼트",
    "part": "lower"
  },
  {
    "id": "stability-ball-crunch",
    "name": "짐볼 크런치",
    "part": "core"
  },
  {
    "id": "stability-ball-hamstring-curl",
    "name": "짐볼 햄스트링 컬",
    "part": "lower"
  },
  {
    "id": "stability-ball-plank",
    "name": "짐볼 플랭크",
    "part": "core"
  },
  {
    "id": "power-clean",
    "name": "파워 클린",
    "part": "core"
  },
  {
    "id": "hang-clean",
    "name": "행 클린",
    "part": "core"
  },
  {
    "id": "push-press",
    "name": "푸시 프레스",
    "part": "core"
  },
  {
    "id": "snatch",
    "name": "스내치",
    "part": "core"
  },
  {
    "id": "clean-and-jerk",
    "name": "클린 앤 저크",
    "part": "core"
  },
  {
    "id": "power-snatch",
    "name": "파워 스내치",
    "part": "core"
  },
  {
    "id": "hang-snatch",
    "name": "행 스내치",
    "part": "core"
  },
  {
    "id": "squat-clean",
    "name": "스쿼트 클린",
    "part": "core"
  },
  {
    "id": "split-jerk",
    "name": "스플릿 저크",
    "part": "core"
  },
  {
    "id": "push-jerk",
    "name": "푸시 저크",
    "part": "core"
  },
  {
    "id": "clean-pull",
    "name": "클린 풀",
    "part": "core"
  },
  {
    "id": "snatch-pull",
    "name": "스내치 풀",
    "part": "core"
  },
  {
    "id": "overhead-squat",
    "name": "오버헤드 스쿼트",
    "part": "core"
  },
  {
    "id": "muscle-snatch",
    "name": "머슬 스내치",
    "part": "core"
  },
  {
    "id": "hang-power-clean",
    "name": "행 파워 클린",
    "part": "core"
  },
  {
    "id": "clean-grip-deadlift",
    "name": "클린 그립 데드리프트",
    "part": "core"
  },
  {
    "id": "snatch-grip-deadlift",
    "name": "스내치 그립 데드리프트",
    "part": "core"
  },
  {
    "id": "sots-press",
    "name": "소츠 프레스",
    "part": "core"
  },
  {
    "id": "clean-and-press",
    "name": "클린 앤 프레스",
    "part": "core"
  },
  {
    "id": "atlas-stone-lift",
    "name": "아틀라스 스톤 리프트",
    "part": "core"
  },
  {
    "id": "yoke-walk",
    "name": "요크 워크",
    "part": "core"
  },
  {
    "id": "log-press",
    "name": "로그 프레스",
    "part": "core"
  },
  {
    "id": "keg-toss",
    "name": "케그 토스",
    "part": "core"
  },
  {
    "id": "tire-flip",
    "name": "타이어 플립",
    "part": "core"
  },
  {
    "id": "car-deadlift",
    "name": "카 데드리프트",
    "part": "core"
  },
  {
    "id": "sandbag-carry",
    "name": "샌드백 캐리",
    "part": "core"
  },
  {
    "id": "hercules-hold",
    "name": "허큘리스 홀드",
    "part": "core"
  },
  {
    "id": "axle-bar-deadlift",
    "name": "액슬 바 데드리프트",
    "part": "core"
  },
  {
    "id": "trap-bar-deadlift",
    "name": "트랩바 데드리프트",
    "part": "lower"
  },
  {
    "id": "continental-clean",
    "name": "컨티넨탈 클린",
    "part": "core"
  },
  {
    "id": "stone-over-bar",
    "name": "스톤 오버 바",
    "part": "core"
  },
  {
    "id": "box-jump",
    "name": "박스 점프",
    "part": "core"
  },
  {
    "id": "broad-jump",
    "name": "브로드 점프",
    "part": "core"
  },
  {
    "id": "jump-lunge",
    "name": "점프 런지",
    "part": "core"
  },
  {
    "id": "depth-jump",
    "name": "뎁스 점프",
    "part": "core"
  },
  {
    "id": "burpee",
    "name": "버피",
    "part": "core"
  },
  {
    "id": "box-jump-over",
    "name": "박스 점프 오버",
    "part": "core"
  },
  {
    "id": "clap-push-up",
    "name": "클랩 푸시업",
    "part": "chest"
  },
  {
    "id": "plyometric-push-up",
    "name": "플라이오메트릭 푸시업",
    "part": "chest"
  },
  {
    "id": "lateral-bound",
    "name": "라테럴 바운드",
    "part": "core"
  },
  {
    "id": "skater-jump",
    "name": "스케이터 점프",
    "part": "core"
  },
  {
    "id": "tuck-jump",
    "name": "턱 점프",
    "part": "core"
  },
  {
    "id": "jump-rope",
    "name": "점프 로프",
    "part": "core"
  },
  {
    "id": "double-under",
    "name": "더블 언더",
    "part": "core"
  },
  {
    "id": "wall-climb",
    "name": "월 클라임",
    "part": "core"
  },
  {
    "id": "handstand-push-up",
    "name": "핸드스탠드 푸시업",
    "part": "shoulder"
  },
  {
    "id": "muscle-up",
    "name": "머슬업",
    "part": "core"
  },
  {
    "id": "kipping-pull-up",
    "name": "키핑 풀업",
    "part": "back"
  },
  {
    "id": "devil-press",
    "name": "데빌 프레스",
    "part": "core"
  },
  {
    "id": "man-maker",
    "name": "맨메이커",
    "part": "core"
  },
  {
    "id": "thruster",
    "name": "쓰러스터",
    "part": "core"
  },
  {
    "id": "american-kettlebell-swing",
    "name": "아메리칸 케틀벨 스윙",
    "part": "core"
  },
  {
    "id": "ghd-sit-up",
    "name": "GHD 싯업",
    "part": "core"
  },
  {
    "id": "bear-crawl",
    "name": "베어 크롤",
    "part": "core"
  },
  {
    "id": "crab-walk",
    "name": "크랩 워크",
    "part": "core"
  },
  {
    "id": "rowing-machine",
    "name": "로잉 머신",
    "part": "core"
  },
  {
    "id": "assault-bike",
    "name": "어썰트 바이크",
    "part": "core"
  },
  {
    "id": "ski-erg",
    "name": "스키 에르그",
    "part": "core"
  },
  {
    "id": "treadmill-running",
    "name": "트레드밀 러닝",
    "part": "core"
  },
  {
    "id": "elliptical-trainer",
    "name": "일립티컬",
    "part": "core"
  },
  {
    "id": "stair-climber",
    "name": "스테어 클라이머",
    "part": "core"
  },
  {
    "id": "dumbbell-external-rotation",
    "name": "덤벨 익스터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-internal-rotation",
    "name": "덤벨 인터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "cable-external-rotation",
    "name": "케이블 익스터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "empty-can-raise",
    "name": "엠티 캔 레이즈",
    "part": "shoulder"
  },
  {
    "id": "full-can-raise",
    "name": "풀 캔 레이즈",
    "part": "shoulder"
  },
  {
    "id": "scaption",
    "name": "스캡션",
    "part": "shoulder"
  },
  {
    "id": "band-external-rotation",
    "name": "밴드 익스터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "prone-cobra",
    "name": "프론 코브라",
    "part": "back"
  },
  {
    "id": "wall-slide",
    "name": "월 슬라이드",
    "part": "shoulder"
  },
  {
    "id": "scapular-pull-up",
    "name": "스캐퓰러 풀업",
    "part": "back"
  },
  {
    "id": "clamshell",
    "name": "클램쉘",
    "part": "lower"
  },
  {
    "id": "fire-hydrant",
    "name": "파이어 하이드런트",
    "part": "lower"
  },
  {
    "id": "single-leg-glute-bridge",
    "name": "싱글 레그 글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "donkey-kick",
    "name": "도네키 킥",
    "part": "lower"
  },
  {
    "id": "cat-cow",
    "name": "캣 카우",
    "part": "core"
  },
  {
    "id": "child-s-pose",
    "name": "차일드 포즈",
    "part": "back"
  },
  {
    "id": "calf-stretch",
    "name": "카프 스트레치",
    "part": "lower"
  },
  {
    "id": "standing-hamstring-stretch",
    "name": "스탠딩 햄스트링 스트레치",
    "part": "lower"
  },
  {
    "id": "figure-4-stretch",
    "name": "피겨4 스트레치",
    "part": "lower"
  },
  {
    "id": "cobra-stretch",
    "name": "코브라 스트레치",
    "part": "core"
  },
  {
    "id": "downward-dog",
    "name": "다운독",
    "part": "core"
  },
  {
    "id": "90-90-hip-stretch",
    "name": "90/90 힙 스트레치",
    "part": "lower"
  },
  {
    "id": "foam-roller-it-band",
    "name": "폼롤러 IT밴드 릴리즈",
    "part": "lower"
  },
  {
    "id": "foam-roller-thoracic",
    "name": "폼롤러 흉추 릴리즈",
    "part": "back"
  },
  {
    "id": "hammer-strength-iso-lateral-row",
    "name": "해머 스트렝스 아이소레터럴 로우",
    "part": "back"
  },
  {
    "id": "hammer-strength-chest-press",
    "name": "해머 스트렝스 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "hammer-strength-shoulder-press",
    "name": "해머 스트렝스 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "hammer-strength-pulldown",
    "name": "해머 스트렝스 풀다운",
    "part": "back"
  },
  {
    "id": "hammer-strength-leg-press",
    "name": "해머 스트렝스 레그 프레스",
    "part": "lower"
  },
  {
    "id": "life-fitness-chest-press",
    "name": "라이프 피트니스 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "life-fitness-leg-extension",
    "name": "라이프 피트니스 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "technogym-pectoral-machine",
    "name": "테크노짐 펙토럴 머신",
    "part": "chest"
  },
  {
    "id": "matrix-seated-row",
    "name": "매트릭스 시티드 로우",
    "part": "back"
  },
  {
    "id": "cybex-leg-press",
    "name": "사이벡스 레그 프레스",
    "part": "lower"
  },
  {
    "id": "pendulum-squat",
    "name": "펜듈럼 스쿼트",
    "part": "lower"
  },
  {
    "id": "v-squat-machine",
    "name": "V-스쿼트 머신",
    "part": "lower"
  },
  {
    "id": "glute-drive-machine",
    "name": "글루트 드라이브 머신",
    "part": "lower"
  },
  {
    "id": "assisted-dip-machine",
    "name": "어시스티드 딥 머신",
    "part": "arm"
  },
  {
    "id": "back-extension-machine",
    "name": "백 익스텐션 머신",
    "part": "back"
  },
  {
    "id": "torso-rotation-machine",
    "name": "토르소 로테이션 머신",
    "part": "core"
  },
  {
    "id": "abdominal-crunch-machine",
    "name": "앱도미널 크런치 머신",
    "part": "core"
  },
  {
    "id": "smith-machine-hip-thrust",
    "name": "스미스 머신 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "wide-grip-bench-press",
    "name": "와이드 그립 벤치프레스",
    "part": "chest"
  },
  {
    "id": "close-grip-push-up",
    "name": "클로즈 그립 푸시업",
    "part": "chest"
  },
  {
    "id": "wide-push-up",
    "name": "와이드 푸시업",
    "part": "chest"
  },
  {
    "id": "archer-push-up",
    "name": "아처 푸시업",
    "part": "chest"
  },
  {
    "id": "spider-man-push-up",
    "name": "스파이더맨 푸시업",
    "part": "chest"
  },
  {
    "id": "high-cable-fly",
    "name": "하이 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "single-arm-cable-crossover",
    "name": "싱글 암 케이블 크로스오버",
    "part": "chest"
  },
  {
    "id": "smith-machine-incline-press",
    "name": "스미스 머신 인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "smith-machine-decline-press",
    "name": "스미스 머신 디클라인 프레스",
    "part": "chest"
  },
  {
    "id": "incline-machine-chest-press",
    "name": "인클라인 머신 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "single-arm-dumbbell-bench-press",
    "name": "싱글 암 덤벨 벤치프레스",
    "part": "chest"
  },
  {
    "id": "neutral-grip-dumbbell-press",
    "name": "뉴트럴 그립 덤벨 프레스",
    "part": "chest"
  },
  {
    "id": "squeeze-press",
    "name": "스쿼즈 프레스",
    "part": "chest"
  },
  {
    "id": "decline-dumbbell-fly",
    "name": "디클라인 덤벨 플라이",
    "part": "chest"
  },
  {
    "id": "wide-grip-barbell-row",
    "name": "와이드 그립 바벨 로우",
    "part": "back"
  },
  {
    "id": "underhand-barbell-row",
    "name": "언더핸드 바벨 로우",
    "part": "back"
  },
  {
    "id": "wide-grip-cable-row",
    "name": "와이드 그립 케이블 로우",
    "part": "back"
  },
  {
    "id": "single-arm-cable-row",
    "name": "싱글 암 케이블 로우",
    "part": "back"
  },
  {
    "id": "neutral-grip-lat-pulldown",
    "name": "뉴트럴 그립 랫 풀다운",
    "part": "back"
  },
  {
    "id": "behind-the-neck-pulldown",
    "name": "비하인드 넥 풀다운",
    "part": "back"
  },
  {
    "id": "single-arm-lat-pulldown",
    "name": "싱글 암 랫 풀다운",
    "part": "back"
  },
  {
    "id": "cable-pullover",
    "name": "케이블 풀오버",
    "part": "back"
  },
  {
    "id": "machine-pullover",
    "name": "머신 풀오버",
    "part": "back"
  },
  {
    "id": "incline-bench-dumbbell-row",
    "name": "인클라인 벤치 덤벨 로우",
    "part": "back"
  },
  {
    "id": "smith-machine-bent-over-row",
    "name": "스미스 머신 벤트오버 로우",
    "part": "back"
  },
  {
    "id": "deficit-deadlift",
    "name": "데피싯 데드리프트",
    "part": "back"
  },
  {
    "id": "block-pull",
    "name": "블록 풀",
    "part": "back"
  },
  {
    "id": "behind-the-back-shrug",
    "name": "비하인드 백 슈러그",
    "part": "back"
  },
  {
    "id": "cable-shrug",
    "name": "케이블 슈러그",
    "part": "back"
  },
  {
    "id": "single-arm-machine-row",
    "name": "싱글 암 머신 로우",
    "part": "back"
  },
  {
    "id": "assisted-chin-up",
    "name": "어시스티드 친업",
    "part": "back"
  },
  {
    "id": "close-neutral-grip-seated-row",
    "name": "클로즈 뉴트럴 그립 시티드 로우",
    "part": "back"
  },
  {
    "id": "single-arm-dumbbell-shoulder-press",
    "name": "싱글 암 덤벨 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "seated-barbell-overhead-press",
    "name": "시티드 바벨 오버헤드 프레스",
    "part": "shoulder"
  },
  {
    "id": "seated-dumbbell-shoulder-press",
    "name": "시티드 덤벨 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "leaning-cable-lateral-raise",
    "name": "리닝 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "lying-side-lateral-raise",
    "name": "라잉 사이드 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-y-raise",
    "name": "케이블 Y 레이즈",
    "part": "shoulder"
  },
  {
    "id": "incline-rear-delt-raise",
    "name": "인클라인 리어 델트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "seated-bent-over-lateral-raise",
    "name": "시티드 벤트오버 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-bottoms-up-press",
    "name": "케틀벨 보텀업 프레스",
    "part": "shoulder"
  },
  {
    "id": "z-press",
    "name": "Z 프레스",
    "part": "shoulder"
  },
  {
    "id": "bradford-press",
    "name": "브래드포드 프레스",
    "part": "shoulder"
  },
  {
    "id": "cuban-press",
    "name": "쿠반 프레스",
    "part": "shoulder"
  },
  {
    "id": "plate-around-the-world",
    "name": "플레이트 어라운드 더 월드",
    "part": "shoulder"
  },
  {
    "id": "single-arm-cable-lateral-raise",
    "name": "싱글 암 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-push-press",
    "name": "덤벨 푸시 프레스",
    "part": "shoulder"
  },
  {
    "id": "wide-grip-barbell-curl",
    "name": "와이드 그립 바벨 컬",
    "part": "arm"
  },
  {
    "id": "close-grip-barbell-curl",
    "name": "클로즈 그립 바벨 컬",
    "part": "arm"
  },
  {
    "id": "cable-ez-bar-curl",
    "name": "케이블 EZ바 컬",
    "part": "arm"
  },
  {
    "id": "single-arm-cable-curl",
    "name": "싱글 암 케이블 컬",
    "part": "arm"
  },
  {
    "id": "high-cable-curl",
    "name": "하이 케이블 컬",
    "part": "arm"
  },
  {
    "id": "machine-biceps-curl",
    "name": "머신 비셉스 컬",
    "part": "arm"
  },
  {
    "id": "cross-body-hammer-curl",
    "name": "크로스 바디 해머 컬",
    "part": "arm"
  },
  {
    "id": "seated-dumbbell-curl",
    "name": "시티드 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "reverse-ez-bar-curl",
    "name": "리버스 EZ바 컬",
    "part": "arm"
  },
  {
    "id": "cable-preacher-curl",
    "name": "케이블 프리처 컬",
    "part": "arm"
  },
  {
    "id": "close-grip-pushdown",
    "name": "클로즈 그립 푸시다운",
    "part": "arm"
  },
  {
    "id": "single-arm-cable-pushdown",
    "name": "싱글 암 케이블 푸시다운",
    "part": "arm"
  },
  {
    "id": "v-bar-pushdown",
    "name": "V바 푸시다운",
    "part": "arm"
  },
  {
    "id": "incline-dumbbell-triceps-extension",
    "name": "인클라인 덤벨 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "cable-lying-triceps-extension",
    "name": "케이블 라잉 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "tate-press",
    "name": "테이트 프레스",
    "part": "arm"
  },
  {
    "id": "close-grip-dumbbell-floor-press",
    "name": "클로즈 그립 덤벨 플로어 프레스",
    "part": "arm"
  },
  {
    "id": "incline-cable-curl",
    "name": "인클라인 케이블 컬",
    "part": "arm"
  },
  {
    "id": "band-overhead-triceps-extension",
    "name": "밴드 오버헤드 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "barbell-wrist-curl",
    "name": "바벨 리스트 컬",
    "part": "arm"
  },
  {
    "id": "pause-squat",
    "name": "포즈 스쿼트",
    "part": "lower"
  },
  {
    "id": "tempo-squat",
    "name": "템포 스쿼트",
    "part": "lower"
  },
  {
    "id": "safety-bar-squat",
    "name": "세이프티 바 스쿼트",
    "part": "lower"
  },
  {
    "id": "wide-stance-leg-press",
    "name": "와이드 스탠스 레그 프레스",
    "part": "lower"
  },
  {
    "id": "close-stance-leg-press",
    "name": "클로즈 스탠스 레그 프레스",
    "part": "lower"
  },
  {
    "id": "single-leg-leg-press-2",
    "name": "싱글 레그 레그 프레스",
    "part": "lower"
  },
  {
    "id": "single-leg-extension",
    "name": "싱글 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "single-leg-curl",
    "name": "싱글 레그 컬",
    "part": "lower"
  },
  {
    "id": "standing-single-leg-curl",
    "name": "스탠딩 싱글 레그 컬",
    "part": "lower"
  },
  {
    "id": "dumbbell-romanian-deadlift",
    "name": "덤벨 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "single-leg-romanian-deadlift",
    "name": "싱글 레그 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "reverse-lunge",
    "name": "리버스 런지",
    "part": "lower"
  },
  {
    "id": "side-lunge",
    "name": "사이드 런지",
    "part": "lower"
  },
  {
    "id": "dumbbell-step-down",
    "name": "덤벨 스텝다운",
    "part": "lower"
  },
  {
    "id": "split-squat",
    "name": "스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "landmine-squat",
    "name": "랜드마인 스쿼트",
    "part": "lower"
  },
  {
    "id": "single-leg-calf-raise",
    "name": "싱글 레그 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "decline-crunch",
    "name": "디클라인 크런치",
    "part": "core"
  },
  {
    "id": "low-to-high-cable-chop",
    "name": "로우 투 하이 케이블 찹",
    "part": "core"
  },
  {
    "id": "hanging-windshield-wiper",
    "name": "행잉 윈드쉴드 와이퍼",
    "part": "core"
  },
  {
    "id": "dumbbell-side-bend",
    "name": "덤벨 사이드 벤드",
    "part": "core"
  },
  {
    "id": "cable-side-bend",
    "name": "케이블 사이드 벤드",
    "part": "core"
  },
  {
    "id": "toe-touch-crunch",
    "name": "토 터치 크런치",
    "part": "core"
  },
  {
    "id": "flutter-kick",
    "name": "플러터 킥",
    "part": "core"
  },
  {
    "id": "scissor-kick",
    "name": "시저 킥",
    "part": "core"
  },
  {
    "id": "hollow-rock",
    "name": "할로우 락",
    "part": "core"
  },
  {
    "id": "l-sit",
    "name": "L 싯",
    "part": "core"
  },
  {
    "id": "hanging-oblique-raise",
    "name": "행잉 오블리크 레이즈",
    "part": "core"
  },
  {
    "id": "standing-cable-crunch",
    "name": "스탠딩 케이블 크런치",
    "part": "core"
  },
  {
    "id": "machine-hip-thrust",
    "name": "머신 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "single-leg-hip-thrust",
    "name": "싱글 레그 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "band-hip-thrust",
    "name": "밴드 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "frog-pump",
    "name": "프로그 펌프",
    "part": "lower"
  },
  {
    "id": "glute-bridge-march",
    "name": "글루트 브릿지 마치",
    "part": "lower"
  },
  {
    "id": "cable-hip-extension",
    "name": "케이블 힙 익스텐션",
    "part": "lower"
  },
  {
    "id": "kettlebell-sumo-deadlift",
    "name": "케틀벨 스모 데드리프트",
    "part": "lower"
  },
  {
    "id": "dumbbell-deadlift",
    "name": "덤벨 데드리프트",
    "part": "lower"
  },
  {
    "id": "trap-bar-squat",
    "name": "트랩바 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-machine-split-squat",
    "name": "스미스 머신 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "kettlebell-lunge",
    "name": "케틀벨 런지",
    "part": "lower"
  },
  {
    "id": "step-up-with-knee-drive",
    "name": "스텝업 윗 니 드라이브",
    "part": "lower"
  },
  {
    "id": "side-lying-hip-abduction",
    "name": "사이드 라잉 힙 어브덕션",
    "part": "lower"
  },
  {
    "id": "copenhagen-plank",
    "name": "코펜하겐 플랭크",
    "part": "lower"
  },
  {
    "id": "calf-press-machine",
    "name": "카프 프레스 머신",
    "part": "lower"
  },
  {
    "id": "single-leg-calf-press",
    "name": "싱글 레그 카프 프레스",
    "part": "lower"
  },
  {
    "id": "standing-toe-raise",
    "name": "스탠딩 토 레이즈",
    "part": "lower"
  },
  {
    "id": "seated-toe-raise",
    "name": "시티드 토 레이즈",
    "part": "lower"
  },
  {
    "id": "band-toe-raise",
    "name": "밴드 토 레이즈",
    "part": "lower"
  },
  {
    "id": "neck-extension",
    "name": "넥 익스텐션",
    "part": "shoulder"
  },
  {
    "id": "neck-flexion",
    "name": "넥 플렉션",
    "part": "shoulder"
  },
  {
    "id": "neck-lateral-flexion",
    "name": "넥 레터럴 플렉션",
    "part": "shoulder"
  },
  {
    "id": "neck-harness-extension",
    "name": "넥 하니스 익스텐션",
    "part": "shoulder"
  },
  {
    "id": "plate-neck-extension",
    "name": "플레이트 넥 익스텐션",
    "part": "shoulder"
  },
  {
    "id": "prone-y-raise",
    "name": "프론 Y 레이즈",
    "part": "shoulder"
  },
  {
    "id": "prone-t-raise",
    "name": "프론 T 레이즈",
    "part": "shoulder"
  },
  {
    "id": "prone-w-raise",
    "name": "프론 W 레이즈",
    "part": "shoulder"
  },
  {
    "id": "prone-l-raise",
    "name": "프론 L 레이즈",
    "part": "shoulder"
  },
  {
    "id": "band-internal-rotation",
    "name": "밴드 인터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "side-lying-external-rotation",
    "name": "사이드 라잉 익스터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "90-degree-external-rotation",
    "name": "90도 익스터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "standing-band-row",
    "name": "스탠딩 밴드 로우",
    "part": "back"
  },
  {
    "id": "dead-hang",
    "name": "데드 행",
    "part": "arm"
  },
  {
    "id": "towel-pull-up",
    "name": "타월 풀업",
    "part": "arm"
  },
  {
    "id": "grip-crusher",
    "name": "그립 크러셔",
    "part": "arm"
  },
  {
    "id": "cable-reverse-curl",
    "name": "케이블 리버스 컬",
    "part": "arm"
  },
  {
    "id": "wrist-extension-machine",
    "name": "리스트 익스텐션 머신",
    "part": "arm"
  },
  {
    "id": "pinch-grip-deadlift",
    "name": "핀치 그립 데드리프트",
    "part": "arm"
  },
  {
    "id": "standing-cable-chest-press",
    "name": "스탠딩 케이블 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "cable-incline-press",
    "name": "케이블 인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "cable-decline-press",
    "name": "케이블 디클라인 프레스",
    "part": "chest"
  },
  {
    "id": "single-arm-cable-chest-press",
    "name": "싱글 암 케이블 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "high-to-low-cable-chop",
    "name": "하이 투 로우 케이블 찹",
    "part": "core"
  },
  {
    "id": "standing-cable-reverse-fly",
    "name": "스탠딩 케이블 리버스 플라이",
    "part": "shoulder"
  },
  {
    "id": "single-arm-cable-front-raise",
    "name": "싱글 암 케이블 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "behind-the-back-cable-shrug",
    "name": "비하인드 백 케이블 슈러그",
    "part": "back"
  },
  {
    "id": "wall-sit",
    "name": "월 싯",
    "part": "lower"
  },
  {
    "id": "plank-up-down",
    "name": "플랭크 업다운",
    "part": "core"
  },
  {
    "id": "side-plank-hip-raise",
    "name": "사이드 플랭크 힙 레이즈",
    "part": "core"
  },
  {
    "id": "rkc-plank",
    "name": "RKC 플랭크",
    "part": "core"
  },
  {
    "id": "superman",
    "name": "슈퍼맨",
    "part": "back"
  },
  {
    "id": "reverse-hyperextension",
    "name": "리버스 하이퍼익스텐션",
    "part": "lower"
  },
  {
    "id": "45-degree-hyperextension",
    "name": "45도 하이퍼익스텐션",
    "part": "back"
  },
  {
    "id": "ghd-back-extension",
    "name": "GHD 백 익스텐션",
    "part": "back"
  },
  {
    "id": "plank-shoulder-tap",
    "name": "플랭크 숄더 탭",
    "part": "core"
  },
  {
    "id": "bear-plank",
    "name": "베어 플랭크",
    "part": "core"
  },
  {
    "id": "kettlebell-high-pull",
    "name": "케틀벨 하이 풀",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-clean-and-press",
    "name": "케틀벨 클린 앤 프레스",
    "part": "core"
  },
  {
    "id": "double-kettlebell-front-squat",
    "name": "더블 케틀벨 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "kettlebell-seesaw-press",
    "name": "케틀벨 시소 프레스",
    "part": "shoulder"
  },
  {
    "id": "single-arm-kettlebell-swing",
    "name": "싱글 암 케틀벨 스윙",
    "part": "core"
  },
  {
    "id": "kettlebell-renegade-row",
    "name": "케틀벨 렌리게이드 로우",
    "part": "back"
  },
  {
    "id": "kettlebell-halo",
    "name": "케틀벨 핼로",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-figure-8",
    "name": "케틀벨 피겨 8",
    "part": "core"
  },
  {
    "id": "band-chest-press",
    "name": "밴드 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "band-row",
    "name": "밴드 로우",
    "part": "back"
  },
  {
    "id": "band-pulldown",
    "name": "밴드 풀다운",
    "part": "back"
  },
  {
    "id": "band-shoulder-press",
    "name": "밴드 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "band-squat",
    "name": "밴드 스쿼트",
    "part": "lower"
  },
  {
    "id": "band-deadlift",
    "name": "밴드 데드리프트",
    "part": "lower"
  },
  {
    "id": "band-woodchopper",
    "name": "밴드 우드찹",
    "part": "core"
  },
  {
    "id": "band-pull-through",
    "name": "밴드 풀스루",
    "part": "lower"
  },
  {
    "id": "hammer-strength-decline-press",
    "name": "해머 스트렝스 디클라인 프레스",
    "part": "chest"
  },
  {
    "id": "hammer-strength-iso-lateral-incline-press",
    "name": "해머 스트렝스 아이소레터럴 인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "hammer-strength-low-row",
    "name": "해머 스트렝스 로우 로우",
    "part": "back"
  },
  {
    "id": "life-fitness-shoulder-press",
    "name": "라이프 피트니스 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "life-fitness-leg-curl",
    "name": "라이프 피트니스 레그 컬",
    "part": "lower"
  },
  {
    "id": "life-fitness-lat-pulldown",
    "name": "라이프 피트니스 랫 풀다운",
    "part": "back"
  },
  {
    "id": "technogym-leg-press",
    "name": "테크노짐 레그 프레스",
    "part": "lower"
  },
  {
    "id": "technogym-shoulder-press",
    "name": "테크노짐 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "matrix-leg-extension",
    "name": "매트릭스 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "matrix-chest-press",
    "name": "매트릭스 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "cybex-arc-trainer",
    "name": "사이벡스 아크 트레이너",
    "part": "core"
  },
  {
    "id": "nautilus-leg-extension",
    "name": "너스 머신 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "precor-machine-row",
    "name": "프리코 머신 로우",
    "part": "back"
  },
  {
    "id": "landmine-180",
    "name": "랜드마인 180",
    "part": "core"
  },
  {
    "id": "landmine-deadlift",
    "name": "랜드마인 데드리프트",
    "part": "lower"
  },
  {
    "id": "landmine-seesaw-press",
    "name": "랜드마인 시소 프레스",
    "part": "shoulder"
  },
  {
    "id": "landmine-lunge",
    "name": "랜드마인 런지",
    "part": "lower"
  },
  {
    "id": "zombie-squat",
    "name": "좀비 스쿼트",
    "part": "lower"
  },
  {
    "id": "spanish-squat",
    "name": "스파니쉬 스쿼트",
    "part": "lower"
  },
  {
    "id": "stability-ball-pike",
    "name": "짐볼 파이크",
    "part": "core"
  },
  {
    "id": "stability-ball-rollout",
    "name": "짐볼 롤아웃",
    "part": "core"
  },
  {
    "id": "slider-mountain-climber",
    "name": "슬라이더 마운틴 클라이머",
    "part": "core"
  },
  {
    "id": "slider-hamstring-curl",
    "name": "슬라이더 햄스트링 컬",
    "part": "lower"
  },
  {
    "id": "slider-reverse-lunge",
    "name": "슬라이더 리버스 런지",
    "part": "lower"
  },
  {
    "id": "bosu-push-up",
    "name": "보수 푸시업",
    "part": "chest"
  },
  {
    "id": "bosu-plank",
    "name": "보수 플랭크",
    "part": "core"
  },
  {
    "id": "medicine-ball-woodchop",
    "name": "메디신볼 우드찹",
    "part": "core"
  },
  {
    "id": "medicine-ball-v-up",
    "name": "메디신볼 V업",
    "part": "core"
  },
  {
    "id": "board-press",
    "name": "보드 프레스",
    "part": "chest"
  },
  {
    "id": "pin-press",
    "name": "핀 프레스",
    "part": "chest"
  },
  {
    "id": "spoto-press",
    "name": "스포토 프레스",
    "part": "chest"
  },
  {
    "id": "larsen-press",
    "name": "라센 프레스",
    "part": "chest"
  },
  {
    "id": "slingshot-bench-press",
    "name": "슬링샷 벤치프레스",
    "part": "chest"
  },
  {
    "id": "pin-squat",
    "name": "핀 스쿼트",
    "part": "lower"
  },
  {
    "id": "safety-bar-good-morning",
    "name": "안전바 굿모닝",
    "part": "back"
  },
  {
    "id": "chain-bench-press",
    "name": "체인 벤치프레스",
    "part": "chest"
  },
  {
    "id": "banded-bench-press",
    "name": "밴드 벤치프레스",
    "part": "chest"
  },
  {
    "id": "close-grip-floor-press",
    "name": "클로즈 그립 플로어 프레스",
    "part": "arm"
  },
  {
    "id": "planche",
    "name": "플란체",
    "part": "core"
  },
  {
    "id": "planche-lean",
    "name": "플란체 리닝",
    "part": "core"
  },
  {
    "id": "front-lever",
    "name": "프론트 레버",
    "part": "core"
  },
  {
    "id": "back-lever",
    "name": "백 레버",
    "part": "core"
  },
  {
    "id": "human-flag",
    "name": "휴먼 플래그",
    "part": "core"
  },
  {
    "id": "handstand-hold",
    "name": "핸드스탠드 홀드",
    "part": "shoulder"
  },
  {
    "id": "pike-push-up",
    "name": "파이크 푸시업",
    "part": "shoulder"
  },
  {
    "id": "korean-dip",
    "name": "코리안 딥스",
    "part": "arm"
  },
  {
    "id": "archer-pull-up",
    "name": "아처 풀업",
    "part": "back"
  },
  {
    "id": "commando-pull-up",
    "name": "커맨도 풀업",
    "part": "back"
  },
  {
    "id": "explosive-pull-up",
    "name": "익스플로시브 풀업",
    "part": "back"
  },
  {
    "id": "negative-pull-up",
    "name": "네거티브 풀업",
    "part": "back"
  },
  {
    "id": "warrior-i-pose",
    "name": "워리어 1 포즈",
    "part": "lower"
  },
  {
    "id": "warrior-ii-pose",
    "name": "워리어 2 포즈",
    "part": "lower"
  },
  {
    "id": "warrior-iii-pose",
    "name": "워리어 3 포즈",
    "part": "lower"
  },
  {
    "id": "tree-pose",
    "name": "트리 포즈",
    "part": "lower"
  },
  {
    "id": "chair-pose",
    "name": "체어 포즈",
    "part": "lower"
  },
  {
    "id": "boat-pose",
    "name": "보트 포즈",
    "part": "core"
  },
  {
    "id": "bridge-pose",
    "name": "브릿지 포즈",
    "part": "lower"
  },
  {
    "id": "pigeon-pose",
    "name": "비둘기 포즈",
    "part": "lower"
  },
  {
    "id": "upward-facing-dog",
    "name": "업워드 독",
    "part": "core"
  },
  {
    "id": "triangle-pose",
    "name": "트라이앵글 포즈",
    "part": "core"
  },
  {
    "id": "camel-pose",
    "name": "캐멀 포즈",
    "part": "core"
  },
  {
    "id": "pilates-hundred",
    "name": "필라테스 헌드레드",
    "part": "core"
  },
  {
    "id": "pilates-roll-up",
    "name": "필라테스 롤업",
    "part": "core"
  },
  {
    "id": "sprint",
    "name": "스프린트",
    "part": "core"
  },
  {
    "id": "hill-sprint",
    "name": "힐 스프린트",
    "part": "core"
  },
  {
    "id": "shuttle-run",
    "name": "셔틀 런",
    "part": "core"
  },
  {
    "id": "high-knees",
    "name": "하이 니",
    "part": "core"
  },
  {
    "id": "butt-kicks",
    "name": "버트 킥",
    "part": "core"
  },
  {
    "id": "jumping-jack",
    "name": "점핑 잭",
    "part": "core"
  },
  {
    "id": "prowler-sprint",
    "name": "프라울러 스프린트",
    "part": "core"
  },
  {
    "id": "sled-row",
    "name": "슬레드 로우",
    "part": "back"
  },
  {
    "id": "battle-rope-slam",
    "name": "배틀로프 슬램",
    "part": "core"
  },
  {
    "id": "battle-rope-alternating-wave",
    "name": "배틀로프 얼터네이팅 웨이브",
    "part": "core"
  },
  {
    "id": "kettlebell-jump-squat",
    "name": "케틀벨 점프 스쿼트",
    "part": "lower"
  },
  {
    "id": "crab-reach",
    "name": "크랩 리치",
    "part": "core"
  },
  {
    "id": "scorpion-stretch",
    "name": "스콜피온 스트레치",
    "part": "core"
  },
  {
    "id": "world-s-greatest-stretch",
    "name": "월드 그레이티스트 스트레치",
    "part": "core"
  },
  {
    "id": "inchworm",
    "name": "인치웜",
    "part": "core"
  },
  {
    "id": "hip-circle",
    "name": "힙 서클",
    "part": "lower"
  },
  {
    "id": "leg-swing",
    "name": "레그 스윙",
    "part": "lower"
  },
  {
    "id": "arm-circle",
    "name": "암 서클",
    "part": "shoulder"
  },
  {
    "id": "thoracic-rotation",
    "name": "토라식 로테이션",
    "part": "back"
  },
  {
    "id": "supine-spinal-twist",
    "name": "수파인 스파인 트위스트",
    "part": "core"
  },
  {
    "id": "deep-squat-hold",
    "name": "디프 스쿼트 홀드",
    "part": "lower"
  },
  {
    "id": "couch-stretch",
    "name": "카우치 스트레치",
    "part": "lower"
  },
  {
    "id": "butterfly-stretch",
    "name": "버터플라이 스트레치",
    "part": "lower"
  },
  {
    "id": "pause-bench-press",
    "name": "포즈 벤치프레스",
    "part": "chest"
  },
  {
    "id": "tempo-bench-press",
    "name": "템포 벤치프레스",
    "part": "chest"
  },
  {
    "id": "pin-deadlift",
    "name": "핀 데드리프트",
    "part": "back"
  },
  {
    "id": "pause-deadlift",
    "name": "포즈 데드리프트",
    "part": "back"
  },
  {
    "id": "tempo-deadlift",
    "name": "템포 데드리프트",
    "part": "back"
  },
  {
    "id": "dead-stop-bench-press",
    "name": "데드스탑 벤치프레스",
    "part": "chest"
  },
  {
    "id": "decline-skull-crusher",
    "name": "디클라인 스컬크러셔",
    "part": "arm"
  },
  {
    "id": "seated-overhead-barbell-extension",
    "name": "시티드 오버헤드 바벨 익스텐션",
    "part": "arm"
  },
  {
    "id": "cable-spider-curl",
    "name": "케이블 스파이더 컬",
    "part": "arm"
  },
  {
    "id": "incline-hammer-curl",
    "name": "인클라인 해머 컬",
    "part": "arm"
  },
  {
    "id": "chest-supported-t-bar-row",
    "name": "체스트 서포티드 T바 로우",
    "part": "back"
  },
  {
    "id": "dead-stop-row",
    "name": "데드스탑 로우",
    "part": "back"
  },
  {
    "id": "feet-elevated-inverted-row",
    "name": "피트 엘리베이티드 인버티드 로우",
    "part": "back"
  },
  {
    "id": "wide-grip-inverted-row",
    "name": "와이드 그립 인버티드 로우",
    "part": "back"
  },
  {
    "id": "close-grip-incline-press",
    "name": "클로즈 그립 인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "reverse-grip-bench-press",
    "name": "리버스 그립 벤치프레스",
    "part": "chest"
  },
  {
    "id": "dumbbell-floor-press",
    "name": "덤벨 플로어 프레스",
    "part": "chest"
  },
  {
    "id": "front-foot-elevated-split-squat",
    "name": "프론트 풋 엘리베이티드 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "deficit-reverse-lunge",
    "name": "데피싯 리버스 런지",
    "part": "lower"
  },
  {
    "id": "overhead-lunge",
    "name": "오버헤드 런지",
    "part": "lower"
  },
  {
    "id": "lateral-step-up",
    "name": "사이드 스텝업",
    "part": "lower"
  },
  {
    "id": "crossover-step-up",
    "name": "크로스오버 스텝업",
    "part": "lower"
  },
  {
    "id": "skater-squat",
    "name": "스케이터 스쿼트",
    "part": "lower"
  },
  {
    "id": "goblet-step-up",
    "name": "고블릿 스텝업",
    "part": "lower"
  },
  {
    "id": "b-stance-romanian-deadlift",
    "name": "B 스탠스 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "b-stance-hip-thrust",
    "name": "B 스탠스 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "kettlebell-single-leg-deadlift",
    "name": "케틀벨 싱글 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "heel-elevated-squat",
    "name": "힐 엘리베이티드 스쿼트",
    "part": "lower"
  },
  {
    "id": "heel-elevated-goblet-squat",
    "name": "힐 엘리베이티드 고블릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "prisoner-squat",
    "name": "프리즈너 스쿼트",
    "part": "lower"
  },
  {
    "id": "dumbbell-thruster",
    "name": "덤벨 쓰러스터",
    "part": "core"
  },
  {
    "id": "kettlebell-thruster",
    "name": "케틀벨 쓰러스터",
    "part": "core"
  },
  {
    "id": "decline-reverse-crunch",
    "name": "디클라인 리버스 크런치",
    "part": "core"
  },
  {
    "id": "hanging-knee-raise-twist",
    "name": "행잉 니 레이즈 트위스트",
    "part": "core"
  },
  {
    "id": "captain-s-chair-oblique-raise",
    "name": "캡틴스 체어 오블리크 레이즈",
    "part": "core"
  },
  {
    "id": "cable-torso-twist",
    "name": "케이블 토르소 트위스트",
    "part": "core"
  },
  {
    "id": "machine-oblique-crunch",
    "name": "머신 오블리크 크런치",
    "part": "core"
  },
  {
    "id": "v-sit-hold",
    "name": "V 싯 홀드",
    "part": "core"
  },
  {
    "id": "jackknife-sit-up",
    "name": "잭나이프 싯업",
    "part": "core"
  },
  {
    "id": "side-medicine-ball-slam",
    "name": "사이드 메디신볼 슬램",
    "part": "core"
  },
  {
    "id": "decline-twisting-sit-up",
    "name": "디클라인 트위스팅 싯업",
    "part": "core"
  },
  {
    "id": "standing-ab-wheel-rollout",
    "name": "스탠딩 앱 휠 롤아웃",
    "part": "core"
  },
  {
    "id": "single-arm-machine-chest-press",
    "name": "싱글 암 머신 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "decline-cable-fly",
    "name": "디클라인 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "lying-cable-fly",
    "name": "라잉 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "weighted-dip",
    "name": "위티드 딥스",
    "part": "chest"
  },
  {
    "id": "ring-dip",
    "name": "링 딥스",
    "part": "chest"
  },
  {
    "id": "ring-push-up",
    "name": "링 푸시업",
    "part": "chest"
  },
  {
    "id": "staggered-push-up",
    "name": "스태거드 푸시업",
    "part": "chest"
  },
  {
    "id": "incline-squeeze-press",
    "name": "인클라인 스쿼즈 프레스",
    "part": "chest"
  },
  {
    "id": "wide-grip-incline-bench-press",
    "name": "와이드 그립 인클라인 벤치프레스",
    "part": "chest"
  },
  {
    "id": "reverse-grip-incline-press",
    "name": "리버스 그립 인클라인 프레스",
    "part": "chest"
  },
  {
    "id": "machine-decline-chest-press",
    "name": "머신 디클라인 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "smith-machine-wide-grip-bench-press",
    "name": "스미스 머신 와이드 그립 벤치프레스",
    "part": "chest"
  },
  {
    "id": "close-grip-barbell-row",
    "name": "클로즈 그립 바벨 로우",
    "part": "back"
  },
  {
    "id": "wide-grip-machine-row",
    "name": "와이드 그립 머신 로우",
    "part": "back"
  },
  {
    "id": "neutral-grip-cable-row",
    "name": "뉴트럴 그립 케이블 로우",
    "part": "back"
  },
  {
    "id": "v-bar-lat-pulldown",
    "name": "V바 랫 풀다운",
    "part": "back"
  },
  {
    "id": "kneeling-cable-face-pull",
    "name": "닐링 케이블 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "underhand-inverted-row",
    "name": "언더핸드 인버티드 로우",
    "part": "back"
  },
  {
    "id": "dumbbell-dead-stop-row",
    "name": "덤벨 데드스탑 로우",
    "part": "back"
  },
  {
    "id": "helms-row",
    "name": "헬름스 로우",
    "part": "back"
  },
  {
    "id": "underhand-pendlay-row",
    "name": "언더핸드 펜들레이 로우",
    "part": "back"
  },
  {
    "id": "trap-bar-row",
    "name": "트랩바 로우",
    "part": "back"
  },
  {
    "id": "seated-high-row-machine",
    "name": "시티드 하이 로우 머신",
    "part": "back"
  },
  {
    "id": "single-arm-straight-arm-pulldown",
    "name": "싱글 암 스트레이트암 풀다운",
    "part": "back"
  },
  {
    "id": "incline-dumbbell-pullover",
    "name": "인클라인 덤벨 풀오버",
    "part": "back"
  },
  {
    "id": "wide-grip-pendlay-row",
    "name": "와이드 그립 펜들레이 로우",
    "part": "back"
  },
  {
    "id": "seated-cable-lateral-raise",
    "name": "시티드 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "incline-cable-lateral-raise",
    "name": "인클라인 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "machine-front-raise",
    "name": "머신 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "behind-the-back-cable-lateral-raise",
    "name": "비하인드 백 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "overhead-pin-press",
    "name": "오버헤드 핀 프레스",
    "part": "shoulder"
  },
  {
    "id": "behind-the-neck-smith-press",
    "name": "비하인드 넥 스미스 프레스",
    "part": "shoulder"
  },
  {
    "id": "seated-smith-machine-shoulder-press",
    "name": "시티드 스미스 머신 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "single-arm-landmine-press",
    "name": "싱글 암 랜드마인 프레스",
    "part": "shoulder"
  },
  {
    "id": "half-kneeling-landmine-press",
    "name": "하프 닐링 랜드마인 프레스",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-6-way-raise",
    "name": "덤벨 6-웨이 레이즈",
    "part": "shoulder"
  },
  {
    "id": "barbell-high-pull",
    "name": "바벨 하이 풀",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-high-pull",
    "name": "덤벨 하이 풀",
    "part": "shoulder"
  },
  {
    "id": "snatch-grip-high-pull",
    "name": "스내치 그립 하이 풀",
    "part": "shoulder"
  },
  {
    "id": "seated-dumbbell-lateral-raise",
    "name": "시티드 덤벨 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-preacher-curl",
    "name": "덤벨 프리처 컬",
    "part": "arm"
  },
  {
    "id": "single-arm-preacher-curl",
    "name": "싱글 암 프리처 컬",
    "part": "arm"
  },
  {
    "id": "ez-bar-preacher-curl",
    "name": "EZ바 프리처 컬",
    "part": "arm"
  },
  {
    "id": "cable-rope-curl",
    "name": "케이블 로프 컬",
    "part": "arm"
  },
  {
    "id": "cable-drag-curl",
    "name": "케이블 드래그 컬",
    "part": "arm"
  },
  {
    "id": "wide-grip-preacher-curl",
    "name": "와이드 그립 프리처 컬",
    "part": "arm"
  },
  {
    "id": "reverse-preacher-curl",
    "name": "리버스 프리처 컬",
    "part": "arm"
  },
  {
    "id": "machine-hammer-curl",
    "name": "머신 해머 컬",
    "part": "arm"
  },
  {
    "id": "wide-grip-cable-curl",
    "name": "와이드 그립 케이블 컬",
    "part": "arm"
  },
  {
    "id": "close-grip-ez-bar-curl",
    "name": "클로즈 그립 EZ바 컬",
    "part": "arm"
  },
  {
    "id": "overhead-cable-curl",
    "name": "오버헤드 케이블 컬",
    "part": "arm"
  },
  {
    "id": "decline-cable-triceps-extension",
    "name": "디클라인 케이블 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "single-arm-overhead-dumbbell-extension",
    "name": "싱글 암 오버헤드 덤벨 익스텐션",
    "part": "arm"
  },
  {
    "id": "reverse-grip-triceps-extension",
    "name": "리버스 그립 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "incline-cable-triceps-extension",
    "name": "인클라인 케이블 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "weighted-bench-dip",
    "name": "위티드 벤치 딥스",
    "part": "arm"
  },
  {
    "id": "machine-dip",
    "name": "머신 딥",
    "part": "arm"
  },
  {
    "id": "single-arm-cable-overhead-extension",
    "name": "싱글 암 케이블 오버헤드 익스텐션",
    "part": "arm"
  },
  {
    "id": "barbell-spider-curl",
    "name": "바벨 스파이더 컬",
    "part": "arm"
  },
  {
    "id": "kettlebell-biceps-curl",
    "name": "케틀벨 비셉스 컬",
    "part": "arm"
  },
  {
    "id": "pause-front-squat",
    "name": "포즈 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "tempo-front-squat",
    "name": "템포 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "wide-stance-squat",
    "name": "와이드 스탠스 스쿼트",
    "part": "lower"
  },
  {
    "id": "close-stance-squat",
    "name": "클로즈 스탠스 스쿼트",
    "part": "lower"
  },
  {
    "id": "jumping-split-squat",
    "name": "점핑 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-machine-reverse-lunge",
    "name": "스미스 머신 리버스 런지",
    "part": "lower"
  },
  {
    "id": "barbell-walking-lunge",
    "name": "바벨 워킹 런지",
    "part": "lower"
  },
  {
    "id": "band-assisted-nordic-curl",
    "name": "밴드 어시스티드 노르딕 컬",
    "part": "lower"
  },
  {
    "id": "cable-leg-curl",
    "name": "케이블 레그 컬",
    "part": "lower"
  },
  {
    "id": "standing-cable-hip-adduction",
    "name": "스탠딩 케이블 힙 어덕션",
    "part": "lower"
  },
  {
    "id": "cossack-squat-2",
    "name": "코사크 스쿼트",
    "part": "lower"
  },
  {
    "id": "assisted-sissy-squat",
    "name": "어시스티드 시시 스쿼트",
    "part": "lower"
  },
  {
    "id": "dumbbell-squat",
    "name": "덤벨 스쿼트",
    "part": "lower"
  },
  {
    "id": "barbell-split-squat",
    "name": "바벨 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "single-leg-leg-press-calf-raise",
    "name": "싱글 레그 레그프레스 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "dumbbell-standing-calf-raise",
    "name": "덤벨 스탠딩 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "dumbbell-jump-squat",
    "name": "덤벨 점프 스쿼트",
    "part": "lower"
  },
  {
    "id": "weighted-box-step-up",
    "name": "위티드 박스 스텝업",
    "part": "lower"
  },
  {
    "id": "reverse-nordic-curl",
    "name": "리버스 노르딕 컬",
    "part": "lower"
  },
  {
    "id": "single-leg-wall-sit",
    "name": "싱글 레그 월 싯",
    "part": "lower"
  },
  {
    "id": "glute-kickback-machine",
    "name": "글루트 킥백 머신",
    "part": "lower"
  },
  {
    "id": "seated-good-morning",
    "name": "시티드 굿모닝",
    "part": "back"
  },
  {
    "id": "barbell-glute-bridge",
    "name": "바벨 글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "pause-hip-thrust",
    "name": "포즈 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "kettlebell-goblet-lunge",
    "name": "케틀벨 고블릿 런지",
    "part": "lower"
  },
  {
    "id": "weighted-plank",
    "name": "위티드 플랭크",
    "part": "core"
  },
  {
    "id": "weighted-sit-up",
    "name": "위티드 싯업",
    "part": "core"
  },
  {
    "id": "weighted-crunch",
    "name": "위티드 크런치",
    "part": "core"
  },
  {
    "id": "decline-russian-twist",
    "name": "디클라인 러시안 트위스트",
    "part": "core"
  },
  {
    "id": "kneeling-cable-oblique-crunch",
    "name": "닐링 케이블 오블리크 크런치",
    "part": "core"
  },
  {
    "id": "weighted-hanging-leg-raise",
    "name": "위티드 행잉 레그 레이즈",
    "part": "core"
  },
  {
    "id": "slider-body-saw",
    "name": "슬라이더 바디 쏘",
    "part": "core"
  },
  {
    "id": "body-saw",
    "name": "바디 쏘",
    "part": "core"
  },
  {
    "id": "half-kneeling-pallof-press",
    "name": "하프 닐링 팔로프 프레스",
    "part": "core"
  },
  {
    "id": "horizontal-cable-chop",
    "name": "호리즌탈 케이블 찹",
    "part": "core"
  },
  {
    "id": "medicine-ball-sit-up",
    "name": "메디신볼 싯업",
    "part": "core"
  },
  {
    "id": "weighted-dead-bug",
    "name": "위티드 데드버그",
    "part": "core"
  },
  {
    "id": "lying-windshield-wiper",
    "name": "라잉 윈드쉴드 와이퍼",
    "part": "core"
  },
  {
    "id": "stir-the-pot",
    "name": "스터 더 팟",
    "part": "core"
  },
  {
    "id": "medicine-ball-toe-touch",
    "name": "메디신볼 토 터치",
    "part": "core"
  },
  {
    "id": "single-arm-cable-fly",
    "name": "싱글 암 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "single-arm-low-cable-fly",
    "name": "싱글 암 로우 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "single-arm-high-cable-fly",
    "name": "싱글 암 하이 케이블 플라이",
    "part": "chest"
  },
  {
    "id": "single-arm-cable-rear-delt-fly",
    "name": "싱글 암 케이블 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "single-arm-cable-upright-row",
    "name": "싱글 암 케이블 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "single-arm-cable-triceps-kickback",
    "name": "싱글 암 케이블 트라이셉스 킥백",
    "part": "arm"
  },
  {
    "id": "single-arm-cable-face-pull",
    "name": "싱글 암 케이블 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "single-arm-cable-shrug",
    "name": "싱글 암 케이블 슈러그",
    "part": "back"
  },
  {
    "id": "rope-cable-front-raise",
    "name": "로프 케이블 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "rope-cable-upright-row",
    "name": "로프 케이블 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "cable-concentration-curl",
    "name": "케이블 컨센트레이션 컬",
    "part": "arm"
  },
  {
    "id": "low-cable-lateral-raise",
    "name": "로우 케이블 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-21s-curl",
    "name": "케이블 21s 컬",
    "part": "arm"
  },
  {
    "id": "wide-grip-cable-pushdown",
    "name": "와이드 그립 케이블 푸시다운",
    "part": "arm"
  },
  {
    "id": "cable-bar-incline-curl",
    "name": "케이블 바 인클라인 컬",
    "part": "arm"
  },
  {
    "id": "seated-single-arm-dumbbell-shoulder-press",
    "name": "시티드 싱글 암 덤벨 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "single-arm-dumbbell-front-raise",
    "name": "싱글 암 덤벨 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "single-arm-dumbbell-lateral-raise",
    "name": "싱글 암 덤벨 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "alternating-dumbbell-curl",
    "name": "얼터네이팅 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "alternating-dumbbell-shoulder-press",
    "name": "얼터네이팅 덤벨 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "alternating-dumbbell-front-raise",
    "name": "얼터네이팅 덤벨 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-reverse-curl",
    "name": "덤벨 리버스 컬",
    "part": "arm"
  },
  {
    "id": "seated-dumbbell-shrug",
    "name": "시티드 덤벨 슈러그",
    "part": "back"
  },
  {
    "id": "single-arm-incline-dumbbell-curl",
    "name": "싱글 암 인클라인 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "dumbbell-floor-fly",
    "name": "덤벨 플로어 플라이",
    "part": "chest"
  },
  {
    "id": "cross-bench-dumbbell-pullover",
    "name": "크로스 벤치 덤벨 풀오버",
    "part": "chest"
  },
  {
    "id": "dumbbell-swing",
    "name": "덤벨 스윙",
    "part": "core"
  },
  {
    "id": "dumbbell-snatch",
    "name": "덤벨 스내치",
    "part": "core"
  },
  {
    "id": "dumbbell-clean",
    "name": "덤벨 클린",
    "part": "core"
  },
  {
    "id": "dumbbell-clean-and-press",
    "name": "덤벨 클린 앤 프레스",
    "part": "core"
  },
  {
    "id": "dumbbell-windmill",
    "name": "덤벨 윈드밀",
    "part": "core"
  },
  {
    "id": "dumbbell-turkish-get-up",
    "name": "덤벨 터키시 겟업",
    "part": "core"
  },
  {
    "id": "dumbbell-renegade-row",
    "name": "덤벨 렌리게이드 로우",
    "part": "back"
  },
  {
    "id": "dumbbell-pull-through",
    "name": "덤벨 풀 쓰루",
    "part": "lower"
  },
  {
    "id": "dumbbell-stiff-leg-deadlift",
    "name": "덤벨 스티프 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "dumbbell-sumo-deadlift",
    "name": "덤벨 스모 데드리프트",
    "part": "lower"
  },
  {
    "id": "dumbbell-hip-thrust",
    "name": "덤벨 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "dumbbell-glute-bridge",
    "name": "덤벨 글루트 브릿지",
    "part": "lower"
  },
  {
    "id": "seated-dumbbell-calf-raise",
    "name": "시티드 덤벨 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "dumbbell-front-squat",
    "name": "덤벨 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "dumbbell-rear-delt-row",
    "name": "덤벨 리어 델트 로우",
    "part": "shoulder"
  },
  {
    "id": "incline-dumbbell-y-raise",
    "name": "인클라인 덤벨 Y 레이즈",
    "part": "shoulder"
  },
  {
    "id": "incline-dumbbell-t-raise",
    "name": "인클라인 덤벨 T 레이즈",
    "part": "shoulder"
  },
  {
    "id": "prone-incline-dumbbell-shrug",
    "name": "프론 인클라인 덤벨 슈러그",
    "part": "back"
  },
  {
    "id": "dumbbell-21s-curl",
    "name": "덤벨 21s 컬",
    "part": "arm"
  },
  {
    "id": "wide-grip-upright-row",
    "name": "와이드 그립 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "close-grip-upright-row",
    "name": "클로즈 그립 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "deficit-pendlay-row",
    "name": "데피싯 펜들레이 로우",
    "part": "back"
  },
  {
    "id": "barbell-hack-lift",
    "name": "바벨 헥 리프트",
    "part": "lower"
  },
  {
    "id": "jefferson-deadlift",
    "name": "제퍼슨 데드리프트",
    "part": "lower"
  },
  {
    "id": "snatch-grip-row",
    "name": "스내치 그립 로우",
    "part": "back"
  },
  {
    "id": "barbell-front-raise",
    "name": "바벨 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "barbell-reverse-wrist-curl",
    "name": "바벨 리버스 리스트 컬",
    "part": "arm"
  },
  {
    "id": "barbell-lunge",
    "name": "바벨 런지",
    "part": "lower"
  },
  {
    "id": "barbell-reverse-lunge",
    "name": "바벨 리버스 런지",
    "part": "lower"
  },
  {
    "id": "barbell-step-up",
    "name": "바벨 스텝업",
    "part": "lower"
  },
  {
    "id": "barbell-calf-raise",
    "name": "바벨 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "zercher-squat",
    "name": "제르커 스쿼트",
    "part": "lower"
  },
  {
    "id": "zercher-deadlift",
    "name": "제르커 데드리프트",
    "part": "lower"
  },
  {
    "id": "zercher-carry",
    "name": "제르커 캐리",
    "part": "core"
  },
  {
    "id": "converging-chest-press-machine",
    "name": "컨버징 체스트 프레스 머신",
    "part": "chest"
  },
  {
    "id": "converging-shoulder-press-machine",
    "name": "컨버징 숄더 프레스 머신",
    "part": "shoulder"
  },
  {
    "id": "diverging-lat-pulldown",
    "name": "다이버징 랫 풀다운",
    "part": "back"
  },
  {
    "id": "standing-leg-curl-machine",
    "name": "스탠딩 레그 컬 머신",
    "part": "lower"
  },
  {
    "id": "lying-t-bar-row-machine",
    "name": "라잉 T바 로우 머신",
    "part": "back"
  },
  {
    "id": "reverse-hack-squat",
    "name": "리버스 핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "incline-chest-fly-machine",
    "name": "인클라인 펙 플라이 머신",
    "part": "chest"
  },
  {
    "id": "decline-chest-fly-machine",
    "name": "디클라인 펙 플라이 머신",
    "part": "chest"
  },
  {
    "id": "seated-leg-press-machine",
    "name": "시티드 레그 프레스 머신",
    "part": "lower"
  },
  {
    "id": "horizontal-calf-raise-machine",
    "name": "호리즌탈 카프 레이즈 머신",
    "part": "lower"
  },
  {
    "id": "single-leg-box-jump",
    "name": "싱글 레그 박스 점프",
    "part": "core"
  },
  {
    "id": "single-leg-broad-jump",
    "name": "싱글 레그 브로드 점프",
    "part": "core"
  },
  {
    "id": "burpee-box-jump-over",
    "name": "버피 박스 점프 오버",
    "part": "core"
  },
  {
    "id": "burpee-pull-up",
    "name": "버피 풀업",
    "part": "core"
  },
  {
    "id": "single-under",
    "name": "싱글 언더",
    "part": "core"
  },
  {
    "id": "lateral-box-shuffle",
    "name": "래터럴 박스 셔플",
    "part": "core"
  },
  {
    "id": "step-up-jump",
    "name": "스텝업 점프",
    "part": "core"
  },
  {
    "id": "kettlebell-clean-and-jerk",
    "name": "케틀벨 클린 앤 저크",
    "part": "core"
  },
  {
    "id": "medicine-ball-backward-toss",
    "name": "메디신볼 백 토스",
    "part": "core"
  },
  {
    "id": "medicine-ball-squat-to-press",
    "name": "메디신볼 스쿼트 투 프레스",
    "part": "core"
  },
  {
    "id": "power-step-up",
    "name": "파워 스텝업",
    "part": "core"
  },
  {
    "id": "criss-cross-jump-rope",
    "name": "크리스크로스 점프 로프",
    "part": "core"
  },
  {
    "id": "inchworm-push-up",
    "name": "인치웜 푸시업",
    "part": "core"
  },
  {
    "id": "sprawl",
    "name": "스프롤",
    "part": "core"
  },
  {
    "id": "star-jump",
    "name": "스타 점프",
    "part": "core"
  },
  {
    "id": "neck-stretch",
    "name": "넥 스트레치",
    "part": "shoulder"
  },
  {
    "id": "cross-body-shoulder-stretch",
    "name": "크로스바디 숄더 스트레치",
    "part": "shoulder"
  },
  {
    "id": "overhead-triceps-stretch",
    "name": "오버헤드 트라이셉스 스트레치",
    "part": "arm"
  },
  {
    "id": "doorway-chest-stretch",
    "name": "도어웨이 체스트 스트레치",
    "part": "chest"
  },
  {
    "id": "lat-stretch",
    "name": "래트 스트레치",
    "part": "back"
  },
  {
    "id": "standing-quad-stretch",
    "name": "스탠딩 쿼드 스트레치",
    "part": "lower"
  },
  {
    "id": "wall-calf-stretch",
    "name": "월 카프 스트레치",
    "part": "lower"
  },
  {
    "id": "kneeling-hip-flexor-stretch",
    "name": "닐링 힙 플렉서 스트레치",
    "part": "lower"
  },
  {
    "id": "seated-glute-stretch",
    "name": "시티드 글루트 스트레치",
    "part": "lower"
  },
  {
    "id": "seated-spinal-twist",
    "name": "시티드 스파인 트위스트",
    "part": "core"
  },
  {
    "id": "thread-the-needle",
    "name": "스레드 더 니들",
    "part": "back"
  },
  {
    "id": "wrist-flexor-stretch",
    "name": "리스트 플렉서 스트레치",
    "part": "arm"
  },
  {
    "id": "wrist-extensor-stretch",
    "name": "리스트 익스텐서 스트레치",
    "part": "arm"
  },
  {
    "id": "ankle-mobility-drill",
    "name": "앵클 모빌리티 드릴",
    "part": "lower"
  },
  {
    "id": "foam-roller-quad-release",
    "name": "폼롤러 쿼드 릴리즈",
    "part": "lower"
  },
  {
    "id": "smith-machine-front-squat",
    "name": "스미스 머신 프론트 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-machine-bulgarian-split-squat",
    "name": "스미스 머신 불가리안 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-machine-seated-calf-raise",
    "name": "스미스 머신 시티드 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "smith-machine-deadlift",
    "name": "스미스 머신 데드리프트",
    "part": "lower"
  },
  {
    "id": "smith-machine-romanian-deadlift",
    "name": "스미스 머신 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "smith-machine-good-morning",
    "name": "스미스 머신 굿모닝",
    "part": "back"
  },
  {
    "id": "smith-machine-shrug",
    "name": "스미스 머신 슈러그",
    "part": "back"
  },
  {
    "id": "smith-machine-upright-row",
    "name": "스미스 머신 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "smith-machine-inverted-row",
    "name": "스미스 머신 인버티드 로우",
    "part": "back"
  },
  {
    "id": "smith-machine-close-grip-bench-press",
    "name": "스미스 머신 클로즈 그립 벤치프레스",
    "part": "arm"
  },
  {
    "id": "smith-machine-box-squat",
    "name": "스미스 머신 박스 스쿼트",
    "part": "lower"
  },
  {
    "id": "smith-machine-stiff-leg-deadlift",
    "name": "스미스 머신 스티프 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "kettlebell-dead-clean",
    "name": "케틀벨 데드 클린",
    "part": "core"
  },
  {
    "id": "kettlebell-push-press",
    "name": "케틀벨 푸시 프레스",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-jerk",
    "name": "케틀벨 저크",
    "part": "core"
  },
  {
    "id": "double-kettlebell-clean",
    "name": "더블 케틀벨 클린",
    "part": "core"
  },
  {
    "id": "double-kettlebell-press",
    "name": "더블 케틀벨 프레스",
    "part": "shoulder"
  },
  {
    "id": "double-kettlebell-snatch",
    "name": "더블 케틀벨 스내치",
    "part": "core"
  },
  {
    "id": "kettlebell-seesaw-row",
    "name": "케틀벨 시소 로우",
    "part": "back"
  },
  {
    "id": "kettlebell-sumo-squat",
    "name": "케틀벨 스모 스쿼트",
    "part": "lower"
  },
  {
    "id": "kettlebell-side-lunge",
    "name": "케틀벨 사이드 런지",
    "part": "lower"
  },
  {
    "id": "kettlebell-overhead-squat",
    "name": "케틀벨 오버헤드 스쿼트",
    "part": "core"
  },
  {
    "id": "kettlebell-overhead-carry",
    "name": "케틀벨 오버헤드 캐리",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-rack-carry",
    "name": "케틀벨 래크 캐리",
    "part": "core"
  },
  {
    "id": "kettlebell-clean-and-squat",
    "name": "케틀벨 클린 앤 스쿼트",
    "part": "core"
  },
  {
    "id": "kettlebell-pullover",
    "name": "케틀벨 풀오버",
    "part": "back"
  },
  {
    "id": "trx-pull-up",
    "name": "TRX 풀업",
    "part": "back"
  },
  {
    "id": "trx-y-fly",
    "name": "TRX Y 플라이",
    "part": "shoulder"
  },
  {
    "id": "trx-t-fly",
    "name": "TRX T 플라이",
    "part": "shoulder"
  },
  {
    "id": "trx-face-pull",
    "name": "TRX 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "trx-single-leg-squat",
    "name": "TRX 싱글 레그 스쿼트",
    "part": "lower"
  },
  {
    "id": "trx-squat",
    "name": "TRX 스쿼트",
    "part": "lower"
  },
  {
    "id": "trx-atomic-push-up",
    "name": "TRX 애토믹 푸시업",
    "part": "chest"
  },
  {
    "id": "trx-mountain-climber",
    "name": "TRX 마운틴 클라이머",
    "part": "core"
  },
  {
    "id": "trx-oblique-crunch",
    "name": "TRX 오블리크 크런치",
    "part": "core"
  },
  {
    "id": "trx-side-plank",
    "name": "TRX 사이드 플랭크",
    "part": "core"
  },
  {
    "id": "band-seated-row",
    "name": "밴드 시티드 로우",
    "part": "back"
  },
  {
    "id": "band-hammer-curl",
    "name": "밴드 해머 컬",
    "part": "arm"
  },
  {
    "id": "band-rear-delt-fly",
    "name": "밴드 리어 델트 플라이",
    "part": "shoulder"
  },
  {
    "id": "band-front-raise",
    "name": "밴드 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "band-upright-row",
    "name": "밴드 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "band-triceps-kickback",
    "name": "밴드 트라이셉스 킥백",
    "part": "arm"
  },
  {
    "id": "band-leg-curl",
    "name": "밴드 레그 컬",
    "part": "lower"
  },
  {
    "id": "band-leg-extension",
    "name": "밴드 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "band-clamshell",
    "name": "밴드 클램쉘",
    "part": "lower"
  },
  {
    "id": "band-standing-hip-abduction",
    "name": "밴드 스탠딩 힙 어브덕션",
    "part": "lower"
  },
  {
    "id": "single-leg-deadlift",
    "name": "싱글 레그 데드리프트",
    "part": "lower"
  },
  {
    "id": "single-leg-hack-squat",
    "name": "싱글 레그 핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "single-leg-glute-kickback-machine",
    "name": "싱글 레그 글루트 킥백 머신",
    "part": "lower"
  },
  {
    "id": "single-leg-smith-calf-raise",
    "name": "싱글 레그 스미스 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "kettlebell-step-up",
    "name": "케틀벨 스텝업",
    "part": "lower"
  },
  {
    "id": "kettlebell-reverse-lunge",
    "name": "케틀벨 리버스 런지",
    "part": "lower"
  },
  {
    "id": "trap-bar-romanian-deadlift",
    "name": "트랩바 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "trap-bar-shrug",
    "name": "트랩바 슈러그",
    "part": "back"
  },
  {
    "id": "trap-bar-calf-raise",
    "name": "트랩바 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "hack-squat-calf-raise",
    "name": "핵 스쿼트 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "weighted-sissy-squat",
    "name": "위티드 시시 스쿼트",
    "part": "lower"
  },
  {
    "id": "band-glute-ham-raise",
    "name": "밴드 글루트 햄 레이즈",
    "part": "lower"
  },
  {
    "id": "weighted-nordic-curl",
    "name": "위티드 노르딕 컬",
    "part": "lower"
  },
  {
    "id": "weighted-back-extension",
    "name": "위티드 백 익스텐션",
    "part": "back"
  },
  {
    "id": "weighted-45-degree-hyperextension",
    "name": "위티드 45도 하이퍼익스텐션",
    "part": "back"
  },
  {
    "id": "standing-hip-abduction-machine",
    "name": "스탠딩 힙 어브덕션 머신",
    "part": "lower"
  },
  {
    "id": "multi-hip-machine-extension",
    "name": "멀티 힙 머신 익스텐션",
    "part": "lower"
  },
  {
    "id": "multi-hip-machine-flexion",
    "name": "멀티 힙 머신 플렉션",
    "part": "lower"
  },
  {
    "id": "multi-hip-machine-abduction",
    "name": "멀티 힙 머신 어브덕션",
    "part": "lower"
  },
  {
    "id": "multi-hip-machine-adduction",
    "name": "멀티 힙 머신 어덕션",
    "part": "lower"
  },
  {
    "id": "dumbbell-wrist-extension",
    "name": "덤벨 리스트 익스텐션",
    "part": "arm"
  },
  {
    "id": "cable-wrist-curl",
    "name": "케이블 리스트 컬",
    "part": "arm"
  },
  {
    "id": "parallel-bar-hang",
    "name": "패럴렐 바 행",
    "part": "arm"
  },
  {
    "id": "towel-hang",
    "name": "타월 행",
    "part": "arm"
  },
  {
    "id": "fat-grip-deadlift",
    "name": "팻 그립 데드리프트",
    "part": "arm"
  },
  {
    "id": "fat-grip-curl",
    "name": "팻 그립 컬",
    "part": "arm"
  },
  {
    "id": "wrist-rotation",
    "name": "리스트 로테이션",
    "part": "arm"
  },
  {
    "id": "rice-bucket-training",
    "name": "라이스 버킷 트레이닝",
    "part": "arm"
  },
  {
    "id": "hand-gripper",
    "name": "핸드 그리퍼",
    "part": "arm"
  },
  {
    "id": "plate-curl",
    "name": "플레이트 컬",
    "part": "arm"
  },
  {
    "id": "lying-hamstring-stretch",
    "name": "라잉 햄스트링 스트레치",
    "part": "lower"
  },
  {
    "id": "seated-hamstring-stretch",
    "name": "시티드 햄스트링 스트레치",
    "part": "lower"
  },
  {
    "id": "standing-side-bend-stretch",
    "name": "스탠딩 사이드 벤드 스트레치",
    "part": "core"
  },
  {
    "id": "sphinx-stretch",
    "name": "스핑크스 스트레치",
    "part": "core"
  },
  {
    "id": "sleeper-stretch",
    "name": "슬리퍼 스트레치",
    "part": "shoulder"
  },
  {
    "id": "corner-pec-stretch",
    "name": "코너 펙 스트레치",
    "part": "chest"
  },
  {
    "id": "levator-scapulae-stretch",
    "name": "레바터 스캐퓰러 스트레치",
    "part": "shoulder"
  },
  {
    "id": "upper-trap-stretch",
    "name": "어퍼 트랩 스트레치",
    "part": "shoulder"
  },
  {
    "id": "frog-stretch",
    "name": "프로그 스트레치",
    "part": "lower"
  },
  {
    "id": "eagle-pose",
    "name": "이글 포즈",
    "part": "core"
  },
  {
    "id": "low-lunge-stretch",
    "name": "로우 런지 스트레치",
    "part": "lower"
  },
  {
    "id": "high-lunge-stretch",
    "name": "하이 런지 스트레치",
    "part": "lower"
  },
  {
    "id": "happy-baby-pose",
    "name": "해피 베이비 포즈",
    "part": "lower"
  },
  {
    "id": "seated-forward-fold",
    "name": "시티드 포워드 폴드",
    "part": "lower"
  },
  {
    "id": "standing-forward-fold",
    "name": "스탠딩 포워드 폴드",
    "part": "lower"
  },
  {
    "id": "wide-leg-forward-fold",
    "name": "와이드 레그 포워드 폴드",
    "part": "lower"
  },
  {
    "id": "lying-quad-stretch",
    "name": "라잉 쿼드 스트레치",
    "part": "lower"
  },
  {
    "id": "it-band-stretch",
    "name": "IT밴드 스트레치",
    "part": "lower"
  },
  {
    "id": "piriformis-stretch",
    "name": "피리포미스 스트레치",
    "part": "lower"
  },
  {
    "id": "foam-roller-calf-release",
    "name": "폼롤러 카프 릴리즈",
    "part": "lower"
  },
  {
    "id": "foam-roller-glute-release",
    "name": "폼롤러 글루트 릴리즈",
    "part": "lower"
  },
  {
    "id": "foam-roller-hamstring-release",
    "name": "폼롤러 햄스트링 릴리즈",
    "part": "lower"
  },
  {
    "id": "foam-roller-lat-release",
    "name": "폼롤러 랫 릴리즈",
    "part": "back"
  },
  {
    "id": "foam-roller-adductor-release",
    "name": "폼롤러 어덕터 릴리즈",
    "part": "lower"
  },
  {
    "id": "40-yard-dash",
    "name": "40야드 대시",
    "part": "core"
  },
  {
    "id": "agility-ladder-drill",
    "name": "어질리티 래더 드릴",
    "part": "core"
  },
  {
    "id": "cone-drill",
    "name": "콘 드릴",
    "part": "core"
  },
  {
    "id": "t-drill",
    "name": "T-드릴",
    "part": "core"
  },
  {
    "id": "5-10-5-pro-agility",
    "name": "5-10-5 프로 어질리티",
    "part": "core"
  },
  {
    "id": "carioca",
    "name": "카리오카",
    "part": "core"
  },
  {
    "id": "backpedal",
    "name": "백페달",
    "part": "core"
  },
  {
    "id": "vertical-jump",
    "name": "버티컬 점프",
    "part": "core"
  },
  {
    "id": "depth-drop",
    "name": "뎁스 드롭",
    "part": "core"
  },
  {
    "id": "overhead-medicine-ball-throw",
    "name": "오버헤드 메디신볼 쓰로우",
    "part": "core"
  },
  {
    "id": "rotational-medicine-ball-throw",
    "name": "로테이셔널 메디신볼 쓰로우",
    "part": "core"
  },
  {
    "id": "power-skip",
    "name": "파워 스킵",
    "part": "core"
  },
  {
    "id": "resisted-sprint",
    "name": "리지스티드 스프린트",
    "part": "core"
  },
  {
    "id": "hurdle-hop",
    "name": "허들 홉",
    "part": "core"
  },
  {
    "id": "single-leg-hop",
    "name": "싱글 레그 홉",
    "part": "core"
  },
  {
    "id": "pilates-side-kick",
    "name": "필라테스 사이드 킥",
    "part": "lower"
  },
  {
    "id": "pilates-leg-circle",
    "name": "필라테스 레그 서클",
    "part": "core"
  },
  {
    "id": "pilates-teaser",
    "name": "필라테스 티저",
    "part": "core"
  },
  {
    "id": "pilates-swan",
    "name": "필라테스 스완",
    "part": "back"
  },
  {
    "id": "pilates-single-leg-stretch",
    "name": "필라테스 싱글 레그 스트레치",
    "part": "core"
  },
  {
    "id": "pilates-double-leg-stretch",
    "name": "필라테스 더블 레그 스트레치",
    "part": "core"
  },
  {
    "id": "pilates-criss-cross",
    "name": "필라테스 크리스크로스",
    "part": "core"
  },
  {
    "id": "barre-pli",
    "name": "바레 플리에",
    "part": "lower"
  },
  {
    "id": "barre-relev",
    "name": "바레 렐레베",
    "part": "lower"
  },
  {
    "id": "barre-arabesque",
    "name": "바레 아라베스크",
    "part": "lower"
  },
  {
    "id": "cow-face-pose",
    "name": "카우 페이스 포즈",
    "part": "shoulder"
  },
  {
    "id": "dancer-pose",
    "name": "댄서 포즈",
    "part": "lower"
  },
  {
    "id": "half-moon-pose",
    "name": "하프 문 포즈",
    "part": "lower"
  },
  {
    "id": "extended-side-angle-pose",
    "name": "익스텐디드 사이드 앵글 포즈",
    "part": "lower"
  },
  {
    "id": "gate-pose",
    "name": "게이트 포즈",
    "part": "core"
  },
  {
    "id": "locust-pose",
    "name": "로커스트 포즈",
    "part": "back"
  },
  {
    "id": "bow-pose",
    "name": "보우 포즈",
    "part": "back"
  },
  {
    "id": "fish-pose",
    "name": "피쉬 포즈",
    "part": "core"
  },
  {
    "id": "wheel-pose",
    "name": "휠 포즈",
    "part": "core"
  },
  {
    "id": "crow-pose",
    "name": "크로우 포즈",
    "part": "core"
  },
  {
    "id": "side-crow",
    "name": "사이드 크로우",
    "part": "core"
  },
  {
    "id": "headstand",
    "name": "헤드스탠드",
    "part": "core"
  },
  {
    "id": "shoulder-stand",
    "name": "숄더스탠드",
    "part": "core"
  },
  {
    "id": "plow-pose",
    "name": "플라우 포즈",
    "part": "back"
  },
  {
    "id": "legs-up-the-wall-pose",
    "name": "레그 업 더 월 포즈",
    "part": "lower"
  },
  {
    "id": "reclined-spinal-twist",
    "name": "리클라인드 스파인 트위스트",
    "part": "core"
  },
  {
    "id": "puppy-pose",
    "name": "퍼피 포즈",
    "part": "back"
  },
  {
    "id": "lizard-pose",
    "name": "리저드 포즈",
    "part": "lower"
  },
  {
    "id": "garland-pose",
    "name": "가랜드 포즈",
    "part": "lower"
  },
  {
    "id": "reverse-warrior",
    "name": "리버스 워리어",
    "part": "lower"
  },
  {
    "id": "90-90-hip-transition",
    "name": "90/90 힙 트랜지션",
    "part": "lower"
  },
  {
    "id": "hip-airplane",
    "name": "힙 에어플레인",
    "part": "lower"
  },
  {
    "id": "ankle-rock",
    "name": "앵클 락",
    "part": "lower"
  },
  {
    "id": "wrist-mobility-circle",
    "name": "리스트 모빌리티 서클",
    "part": "arm"
  },
  {
    "id": "shoulder-dislocate",
    "name": "숄더 디스로케이트",
    "part": "shoulder"
  },
  {
    "id": "stick-pass-through",
    "name": "스틱 패스스루",
    "part": "shoulder"
  },
  {
    "id": "thoracic-bridge",
    "name": "토라식 브릿지",
    "part": "back"
  },
  {
    "id": "fire-hydrant-circle",
    "name": "파이어 하이드런트 서클",
    "part": "lower"
  },
  {
    "id": "spider-man-stretch",
    "name": "스파이더맨 스트레치",
    "part": "lower"
  },
  {
    "id": "cossack-rock",
    "name": "코사크 록",
    "part": "lower"
  },
  {
    "id": "deep-lunge-with-twist",
    "name": "딥 런지 위드 트위스트",
    "part": "core"
  },
  {
    "id": "dynamic-calf-stretch",
    "name": "다이나믹 카프 스트레치",
    "part": "lower"
  },
  {
    "id": "lateral-leg-swing",
    "name": "라테럴 레그 스윙",
    "part": "lower"
  },
  {
    "id": "backward-arm-circle",
    "name": "백워드 암 서클",
    "part": "shoulder"
  },
  {
    "id": "neck-cars",
    "name": "넥 CARs",
    "part": "shoulder"
  },
  {
    "id": "hand-release-push-up",
    "name": "핸드 릴리즈 푸시업",
    "part": "chest"
  },
  {
    "id": "hindu-push-up",
    "name": "힌두 푸시업",
    "part": "chest"
  },
  {
    "id": "dive-bomber-push-up",
    "name": "다이브 바머 푸시업",
    "part": "chest"
  },
  {
    "id": "pseudo-planche-push-up",
    "name": "슈도 플란체 푸시업",
    "part": "chest"
  },
  {
    "id": "one-arm-push-up",
    "name": "원암 푸시업",
    "part": "chest"
  },
  {
    "id": "kneeling-push-up",
    "name": "닐링 푸시업",
    "part": "chest"
  },
  {
    "id": "tempo-push-up",
    "name": "템포 푸시업",
    "part": "chest"
  },
  {
    "id": "straight-bar-dip",
    "name": "스트레이트 바 딥",
    "part": "arm"
  },
  {
    "id": "l-sit-pull-up",
    "name": "L-싯 풀업",
    "part": "back"
  },
  {
    "id": "typewriter-pull-up",
    "name": "타입라이터 풀업",
    "part": "back"
  },
  {
    "id": "close-grip-chin-up",
    "name": "클로즈 그립 친업",
    "part": "back"
  },
  {
    "id": "single-arm-inverted-row",
    "name": "싱글 암 인버티드 로우",
    "part": "back"
  },
  {
    "id": "scapular-push-up",
    "name": "스캐퓰러 푸시업",
    "part": "back"
  },
  {
    "id": "scapular-dip",
    "name": "스캐퓰러 딥",
    "part": "back"
  },
  {
    "id": "wall-walk",
    "name": "월 워크",
    "part": "core"
  },
  {
    "id": "freestanding-handstand",
    "name": "프리스탠딩 핸드스탠드",
    "part": "shoulder"
  },
  {
    "id": "shrimp-squat",
    "name": "쉬림프 스쿼트",
    "part": "lower"
  },
  {
    "id": "assisted-pistol-squat",
    "name": "어시스티드 피스톨 스쿼트",
    "part": "lower"
  },
  {
    "id": "hanging-l-sit",
    "name": "행잉 L-싯",
    "part": "core"
  },
  {
    "id": "active-hang",
    "name": "액티브 행",
    "part": "back"
  },
  {
    "id": "glute-bridge-with-abduction",
    "name": "글루트 브릿지 어브덕션",
    "part": "lower"
  },
  {
    "id": "superman-pull",
    "name": "슈퍼맨 풀",
    "part": "back"
  },
  {
    "id": "reverse-snow-angel",
    "name": "리버스 스노우 엔젤",
    "part": "back"
  },
  {
    "id": "no-money-exercise",
    "name": "노 머니 익서사이즈",
    "part": "shoulder"
  },
  {
    "id": "squat-jack",
    "name": "스쿼트 잭",
    "part": "core"
  },
  {
    "id": "plank-jack",
    "name": "플랭크 잭",
    "part": "core"
  },
  {
    "id": "cross-body-mountain-climber",
    "name": "크로스바디 마운틴 클라이머",
    "part": "core"
  },
  {
    "id": "walking-push-up",
    "name": "워킹 푸시업",
    "part": "chest"
  },
  {
    "id": "pulse-lunge",
    "name": "펄스 런지",
    "part": "lower"
  },
  {
    "id": "pulse-squat",
    "name": "펄스 스쿼트",
    "part": "lower"
  },
  {
    "id": "duck-walk",
    "name": "덕 워크",
    "part": "lower"
  },
  {
    "id": "backward-bear-crawl",
    "name": "백워드 베어 크롤",
    "part": "core"
  },
  {
    "id": "lateral-crab-walk",
    "name": "라테럴 크랩 워크",
    "part": "core"
  },
  {
    "id": "high-knee-skip",
    "name": "하이 니 스킵",
    "part": "core"
  },
  {
    "id": "toe-tap",
    "name": "토 탭",
    "part": "core"
  },
  {
    "id": "step-jack",
    "name": "스텝 잭",
    "part": "core"
  },
  {
    "id": "plank-toe-tap",
    "name": "플랭크 토 탭",
    "part": "core"
  },
  {
    "id": "side-plank-rotation",
    "name": "사이드 플랭크 로테이션",
    "part": "core"
  },
  {
    "id": "bird-dog-crunch",
    "name": "버드독 크런치",
    "part": "core"
  },
  {
    "id": "swimmer-exercise",
    "name": "스위머",
    "part": "back"
  },
  {
    "id": "neutral-grip-incline-dumbbell-press",
    "name": "뉴트럴 그립 인클라인 덤벨 프레스",
    "part": "chest"
  },
  {
    "id": "neutral-grip-decline-dumbbell-press",
    "name": "뉴트럴 그립 디클라인 덤벨 프레스",
    "part": "chest"
  },
  {
    "id": "swiss-bar-bench-press",
    "name": "스위스바 벤치프레스",
    "part": "chest"
  },
  {
    "id": "swiss-bar-overhead-press",
    "name": "스위스바 오버헤드 프레스",
    "part": "shoulder"
  },
  {
    "id": "swiss-bar-close-grip-press",
    "name": "스위스바 클로즈 그립 프레스",
    "part": "arm"
  },
  {
    "id": "incline-bench-cable-press",
    "name": "인클라인 벤치 케이블 프레스",
    "part": "chest"
  },
  {
    "id": "seated-cable-chest-press",
    "name": "시티드 케이블 체스트 프레스",
    "part": "chest"
  },
  {
    "id": "decline-barbell-pullover",
    "name": "디클라인 바벨 풀오버",
    "part": "chest"
  },
  {
    "id": "barbell-pullover",
    "name": "바벨 풀오버",
    "part": "chest"
  },
  {
    "id": "smith-machine-floor-press",
    "name": "스미스 머신 플로어 프레스",
    "part": "chest"
  },
  {
    "id": "reverse-grip-dumbbell-press",
    "name": "리버스 그립 덤벨 프레스",
    "part": "chest"
  },
  {
    "id": "wide-grip-dip",
    "name": "와이드 그립 딥스",
    "part": "chest"
  },
  {
    "id": "close-grip-dip",
    "name": "클로즈 그립 딥스",
    "part": "arm"
  },
  {
    "id": "forward-lean-dip",
    "name": "포워드 린 딥스",
    "part": "chest"
  },
  {
    "id": "band-assisted-dip",
    "name": "밴드 어시스티드 딥스",
    "part": "chest"
  },
  {
    "id": "chest-supported-dumbbell-row",
    "name": "체스트 서포티드 덤벨 로우",
    "part": "back"
  },
  {
    "id": "incline-bench-barbell-row",
    "name": "인클라인 벤치 바벨 로우",
    "part": "back"
  },
  {
    "id": "wide-grip-seated-row",
    "name": "와이드 그립 시티드 로우",
    "part": "back"
  },
  {
    "id": "underhand-seated-cable-row",
    "name": "언더핸드 시티드 케이블 로우",
    "part": "back"
  },
  {
    "id": "kettlebell-bent-over-row",
    "name": "케틀벨 벤트오버 로우",
    "part": "back"
  },
  {
    "id": "double-kettlebell-row",
    "name": "더블 케틀벨 로우",
    "part": "back"
  },
  {
    "id": "incline-cable-row",
    "name": "인클라인 케이블 로우",
    "part": "back"
  },
  {
    "id": "high-cable-row",
    "name": "하이 케이블 로우",
    "part": "back"
  },
  {
    "id": "low-cable-row",
    "name": "로우 케이블 로우",
    "part": "back"
  },
  {
    "id": "close-neutral-grip-lat-pulldown",
    "name": "클로즈 뉴트럴 랫 풀다운",
    "part": "back"
  },
  {
    "id": "behind-the-neck-pull-up",
    "name": "비하인드 넥 풀업",
    "part": "back"
  },
  {
    "id": "medium-grip-pull-up",
    "name": "미디엄 그립 풀업",
    "part": "back"
  },
  {
    "id": "mixed-grip-pull-up",
    "name": "믹스드 그립 풀업",
    "part": "back"
  },
  {
    "id": "super-wide-grip-pulldown",
    "name": "슈퍼 와이드 그립 풀다운",
    "part": "back"
  },
  {
    "id": "seated-cable-face-pull",
    "name": "시티드 케이블 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "seated-behind-the-neck-press",
    "name": "시티드 비하인드 넥 프레스",
    "part": "shoulder"
  },
  {
    "id": "pin-shoulder-press",
    "name": "핀 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "smith-machine-bradford-press",
    "name": "스미스 머신 브래드포드 프레스",
    "part": "shoulder"
  },
  {
    "id": "seated-kettlebell-press",
    "name": "시티드 케틀벨 프레스",
    "part": "shoulder"
  },
  {
    "id": "chest-supported-rear-delt-raise",
    "name": "체스트 서포티드 리어 델트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "wide-cable-face-pull",
    "name": "와이드 케이블 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "decline-bench-rear-delt-raise",
    "name": "디클라인 벤치 리어 델트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "plate-loaded-lateral-raise-machine",
    "name": "플레이트 로디드 레터럴 레이즈 머신",
    "part": "shoulder"
  },
  {
    "id": "band-y-raise",
    "name": "밴드 Y 레이즈",
    "part": "shoulder"
  },
  {
    "id": "lying-cable-rear-delt-raise",
    "name": "라잉 케이블 리어 델트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "behind-the-neck-push-press",
    "name": "비하인드 넥 푸시 프레스",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-front-raise",
    "name": "케틀벨 프론트 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-internal-rotation",
    "name": "케이블 인터널 로테이션",
    "part": "shoulder"
  },
  {
    "id": "prone-band-pull-apart",
    "name": "프론 밴드 풀어파트",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-lateral-raise",
    "name": "케틀벨 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "single-arm-machine-curl",
    "name": "싱글 암 머신 컬",
    "part": "arm"
  },
  {
    "id": "behind-the-back-cable-curl",
    "name": "비하인드 백 케이블 컬",
    "part": "arm"
  },
  {
    "id": "pronated-dumbbell-curl",
    "name": "프로네이티드 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "ez-bar-reverse-curl",
    "name": "EZ바 리버스 컬",
    "part": "arm"
  },
  {
    "id": "kettlebell-hammer-curl",
    "name": "케틀벨 해머 컬",
    "part": "arm"
  },
  {
    "id": "incline-dumbbell-reverse-curl",
    "name": "인클라인 덤벨 리버스 컬",
    "part": "arm"
  },
  {
    "id": "bar-cable-overhead-triceps-extension",
    "name": "바 케이블 오버헤드 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "dumbbell-lying-triceps-extension",
    "name": "덤벨 라잉 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "single-arm-dumbbell-lying-extension",
    "name": "싱글 암 덤벨 라잉 익스텐션",
    "part": "arm"
  },
  {
    "id": "cross-body-cable-extension",
    "name": "크로스보디 케이블 익스텐션",
    "part": "arm"
  },
  {
    "id": "machine-overhead-extension",
    "name": "머신 오버헤드 익스텐션",
    "part": "arm"
  },
  {
    "id": "feet-elevated-bench-dip",
    "name": "피트 엘리베이티드 벤치 딥스",
    "part": "arm"
  },
  {
    "id": "rope-overhead-triceps-extension",
    "name": "로프 오버헤드 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "decline-close-grip-bench-press",
    "name": "디클라인 클로즈 그립 벤치프레스",
    "part": "arm"
  },
  {
    "id": "incline-close-grip-bench-press",
    "name": "인클라인 클로즈 그립 벤치프레스",
    "part": "arm"
  },
  {
    "id": "1-5-rep-squat",
    "name": "1.5 렙 스쿼트",
    "part": "lower"
  },
  {
    "id": "1-5-rep-leg-press",
    "name": "1.5 렙 레그 프레스",
    "part": "lower"
  },
  {
    "id": "1-5-rep-lunge",
    "name": "1.5 렙 런지",
    "part": "lower"
  },
  {
    "id": "pause-leg-extension",
    "name": "페이즈 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "pause-leg-curl",
    "name": "페이즈 레그 컬",
    "part": "lower"
  },
  {
    "id": "pause-calf-raise",
    "name": "페이즈 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "behind-the-back-deadlift",
    "name": "비하인드 더 백 데드리프트",
    "part": "lower"
  },
  {
    "id": "deficit-sumo-deadlift",
    "name": "데피싯 스모 데드리프트",
    "part": "lower"
  },
  {
    "id": "full-rom-leg-press",
    "name": "풀 ROM 레그 프레스",
    "part": "lower"
  },
  {
    "id": "pause-bulgarian-split-squat",
    "name": "페이즈 불가리안 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "tempo-bulgarian-split-squat",
    "name": "템포 불가리안 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "deficit-split-squat",
    "name": "데피싯 스플릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "pause-goblet-squat",
    "name": "페이즈 고블릿 스쿼트",
    "part": "lower"
  },
  {
    "id": "wide-stance-hack-squat",
    "name": "와이드 핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "close-stance-hack-squat",
    "name": "클로즈 핵 스쿼트",
    "part": "lower"
  },
  {
    "id": "double-kettlebell-romanian-deadlift",
    "name": "더블 케틀벨 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "single-leg-glute-bridge-march",
    "name": "싱글 레그 글루트 브릿지 마치",
    "part": "lower"
  },
  {
    "id": "sissy-squat-machine",
    "name": "시시 스쿼트 머신",
    "part": "lower"
  },
  {
    "id": "weighted-glute-ham-raise",
    "name": "위티드 글루트 햄 레이즈",
    "part": "lower"
  },
  {
    "id": "weighted-reverse-nordic-curl",
    "name": "위티드 리버스 노르딕 컬",
    "part": "lower"
  },
  {
    "id": "weighted-toes-to-bar",
    "name": "위티드 토즈 투 바",
    "part": "core"
  },
  {
    "id": "captain-s-chair-twisting-raise",
    "name": "캡틴스 체어 트위스팅 레이즈",
    "part": "core"
  },
  {
    "id": "seated-cable-woodchop",
    "name": "시티드 케이블 우드찹",
    "part": "core"
  },
  {
    "id": "weighted-decline-sit-up",
    "name": "위티드 디클라인 싯업",
    "part": "core"
  },
  {
    "id": "stability-ball-jackknife",
    "name": "스위스볼 잭나이프",
    "part": "core"
  },
  {
    "id": "dragon-flag-negative",
    "name": "드래곤 플래그 네거티브",
    "part": "core"
  },
  {
    "id": "anti-rotation-hold",
    "name": "안티 로테이션 홀드",
    "part": "core"
  },
  {
    "id": "side-plank-with-reach",
    "name": "사이드 플랭크 위드 리치",
    "part": "core"
  },
  {
    "id": "plank-with-leg-lift",
    "name": "플랭크 위드 레그 리프트",
    "part": "core"
  },
  {
    "id": "boat-to-low-boat",
    "name": "보트 투 로우 보트",
    "part": "core"
  },
  {
    "id": "suitcase-carry",
    "name": "수트케이스 캐리",
    "part": "core"
  },
  {
    "id": "overhead-barbell-carry",
    "name": "오버헤드 바벨 캐리",
    "part": "shoulder"
  },
  {
    "id": "double-kettlebell-front-rack-carry",
    "name": "더블 케틀벨 프론트 랙 캐리",
    "part": "core"
  },
  {
    "id": "bottoms-up-kettlebell-carry",
    "name": "보텀업 케틀벨 캐리",
    "part": "shoulder"
  },
  {
    "id": "trap-bar-carry",
    "name": "트랩바 캐리",
    "part": "core"
  },
  {
    "id": "plate-pinch-carry",
    "name": "플레이트 핀치 캐리",
    "part": "arm"
  },
  {
    "id": "sandbag-shouldering",
    "name": "샌드백 숄더링",
    "part": "core"
  },
  {
    "id": "sandbag-clean",
    "name": "샌드백 클린",
    "part": "core"
  },
  {
    "id": "sandbag-squat",
    "name": "샌드백 스쿼트",
    "part": "lower"
  },
  {
    "id": "sandbag-lunge",
    "name": "샌드백 런지",
    "part": "lower"
  },
  {
    "id": "eccentric-chin-up",
    "name": "이센트릭 친업",
    "part": "back"
  },
  {
    "id": "eccentric-bench-press",
    "name": "이센트릭 벤치프레스",
    "part": "chest"
  },
  {
    "id": "eccentric-squat",
    "name": "이센트릭 스쿼트",
    "part": "lower"
  },
  {
    "id": "eccentric-deadlift",
    "name": "이센트릭 데드리프트",
    "part": "back"
  },
  {
    "id": "eccentric-leg-curl",
    "name": "이센트릭 레그 컬",
    "part": "lower"
  },
  {
    "id": "partial-deadlift",
    "name": "파셜 데드리프트",
    "part": "back"
  },
  {
    "id": "partial-squat",
    "name": "파셜 스쿼트",
    "part": "lower"
  },
  {
    "id": "partial-lateral-raise",
    "name": "파셜 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "partial-barbell-curl",
    "name": "파셜 바벨 컬",
    "part": "arm"
  },
  {
    "id": "top-half-leg-extension",
    "name": "톱 하프 레그 익스텐션",
    "part": "lower"
  },
  {
    "id": "bottom-half-squat",
    "name": "바텀 하프 스쿼트",
    "part": "lower"
  },
  {
    "id": "isometric-bench-hold",
    "name": "아이소메트릭 벤치 홀드",
    "part": "chest"
  },
  {
    "id": "isometric-squat-hold",
    "name": "아이소메트릭 스쿼트 홀드",
    "part": "lower"
  },
  {
    "id": "isometric-deadlift-hold",
    "name": "아이소메트릭 데드리프트 홀드",
    "part": "back"
  },
  {
    "id": "isometric-curl-hold",
    "name": "아이소메트릭 컬 홀드",
    "part": "arm"
  },
  {
    "id": "isometric-lateral-raise-hold",
    "name": "아이소메트릭 레터럴 레이즈 홀드",
    "part": "shoulder"
  },
  {
    "id": "isometric-pull-up-hold",
    "name": "아이소메트릭 풀업 홀드",
    "part": "back"
  },
  {
    "id": "isometric-push-up-hold",
    "name": "아이소메트릭 푸시업 홀드",
    "part": "chest"
  },
  {
    "id": "tempo-pull-up",
    "name": "템포 풀업",
    "part": "back"
  },
  {
    "id": "tempo-leg-press",
    "name": "템포 레그 프레스",
    "part": "lower"
  },
  {
    "id": "tempo-row",
    "name": "템포 로우",
    "part": "back"
  },
  {
    "id": "tempo-overhead-press",
    "name": "템포 오버헤드 프레스",
    "part": "shoulder"
  },
  {
    "id": "tempo-curl",
    "name": "템포 컬",
    "part": "arm"
  },
  {
    "id": "tempo-lateral-raise",
    "name": "템포 레터럴 레이즈",
    "part": "shoulder"
  },
  {
    "id": "eccentric-nordic-curl",
    "name": "이센트릭 노르딕 컬",
    "part": "lower"
  },
  {
    "id": "eccentric-calf-raise",
    "name": "이센트릭 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "partial-leg-press",
    "name": "파셜 레그 프레스",
    "part": "lower"
  },
  {
    "id": "partial-pulldown",
    "name": "파셜 풀다운",
    "part": "back"
  },
  {
    "id": "1-25-rep-bench-press",
    "name": "1.25 렙 벤치프레스",
    "part": "chest"
  },
  {
    "id": "1-5-rep-shoulder-press",
    "name": "1.5 렙 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "single-arm-machine-shoulder-press",
    "name": "싱글 암 머신 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "single-arm-machine-lat-pulldown",
    "name": "싱글 암 머신 랫 풀다운",
    "part": "back"
  },
  {
    "id": "single-arm-machine-rear-delt",
    "name": "싱글 암 머신 리어 델트",
    "part": "shoulder"
  },
  {
    "id": "single-arm-pec-deck-fly",
    "name": "싱글 암 펙덱 플라이",
    "part": "chest"
  },
  {
    "id": "single-arm-cable-pulldown",
    "name": "싱글 암 케이블 풀다운",
    "part": "back"
  },
  {
    "id": "single-arm-landmine-row",
    "name": "싱글 암 랜드마인 로우",
    "part": "back"
  },
  {
    "id": "single-arm-smith-row",
    "name": "싱글 암 스미스 로우",
    "part": "back"
  },
  {
    "id": "single-arm-dumbbell-skull-crusher",
    "name": "싱글 암 덤벨 스컬크러셔",
    "part": "arm"
  },
  {
    "id": "single-arm-cable-crunch",
    "name": "싱글 암 케이블 크런치",
    "part": "core"
  },
  {
    "id": "single-arm-kettlebell-clean",
    "name": "싱글 암 케틀벨 클린",
    "part": "core"
  },
  {
    "id": "single-arm-kettlebell-snatch",
    "name": "싱글 암 케틀벨 스내치",
    "part": "core"
  },
  {
    "id": "one-arm-pull-up",
    "name": "원암 풀업",
    "part": "back"
  },
  {
    "id": "single-leg-machine-hip-thrust",
    "name": "싱글 레그 머신 힙 쓰러스트",
    "part": "lower"
  },
  {
    "id": "single-arm-dumbbell-floor-press",
    "name": "싱글 암 덤벨 플로어 프레스",
    "part": "chest"
  },
  {
    "id": "single-arm-overhead-carry",
    "name": "싱글 암 오버헤드 캐리",
    "part": "shoulder"
  },
  {
    "id": "single-arm-dumbbell-deadlift",
    "name": "싱글 암 덤벨 데드리프트",
    "part": "lower"
  },
  {
    "id": "kneeling-single-arm-cable-row",
    "name": "닐링 싱글 암 케이블 로우",
    "part": "back"
  },
  {
    "id": "kneeling-single-arm-lat-pulldown",
    "name": "닐링 싱글 암 랫 풀다운",
    "part": "back"
  },
  {
    "id": "barbell-single-leg-romanian-deadlift",
    "name": "바벨 싱글 레그 루마니안 데드리프트",
    "part": "lower"
  },
  {
    "id": "kneeling-single-arm-cable-curl",
    "name": "닐링 싱글 암 케이블 컬",
    "part": "arm"
  },
  {
    "id": "continuous-box-jump",
    "name": "컨티뉴어스 박스 점프",
    "part": "core"
  },
  {
    "id": "continuous-broad-jump",
    "name": "컨티뉴어스 브로드 점프",
    "part": "core"
  },
  {
    "id": "triple-under",
    "name": "트리플 언더",
    "part": "core"
  },
  {
    "id": "burpee-broad-jump",
    "name": "버피 브로드 점프",
    "part": "core"
  },
  {
    "id": "ladder-in-and-out",
    "name": "라더 인앤아웃",
    "part": "core"
  },
  {
    "id": "ladder-icky-shuffle",
    "name": "라더 아이키 셔플",
    "part": "core"
  },
  {
    "id": "cone-weave",
    "name": "콘 위브",
    "part": "core"
  },
  {
    "id": "box-drill",
    "name": "박스 드릴",
    "part": "core"
  },
  {
    "id": "star-drill",
    "name": "스타 드릴",
    "part": "core"
  },
  {
    "id": "backward-sled-drag",
    "name": "백워드 슬레드 드래그",
    "part": "lower"
  },
  {
    "id": "lateral-sled-drag",
    "name": "라테럴 슬레드 드래그",
    "part": "lower"
  },
  {
    "id": "battle-rope-in-and-out",
    "name": "배틀로프 인앤아웃",
    "part": "core"
  },
  {
    "id": "battle-rope-side-to-side",
    "name": "배틀로프 사이드 투 사이드",
    "part": "core"
  },
  {
    "id": "battle-rope-jumping-slam",
    "name": "배틀로프 점프 슬램",
    "part": "core"
  },
  {
    "id": "rope-climb",
    "name": "로프 클라임",
    "part": "core"
  },
  {
    "id": "pegboard-climb",
    "name": "페그보드 클라임",
    "part": "core"
  },
  {
    "id": "tire-jump-in-and-out",
    "name": "타이어 점프 인앤아웃",
    "part": "core"
  },
  {
    "id": "side-wall-ball",
    "name": "사이드 월 볼",
    "part": "core"
  },
  {
    "id": "dead-ball-over-shoulder-toss",
    "name": "데드볼 오버 숄더 토스",
    "part": "core"
  },
  {
    "id": "sandbag-carry-interval",
    "name": "샌드백 캐리 인터벌",
    "part": "core"
  },
  {
    "id": "aqua-jogging",
    "name": "아쿠아 조깅",
    "part": "core"
  },
  {
    "id": "pool-walking",
    "name": "풀 워킹",
    "part": "core"
  },
  {
    "id": "water-aerobics",
    "name": "워터 에어로빅",
    "part": "core"
  },
  {
    "id": "backward-monster-walk",
    "name": "백워드 몬스터 워크",
    "part": "lower"
  },
  {
    "id": "band-lateral-walk",
    "name": "밴드 라테럴 워크",
    "part": "lower"
  },
  {
    "id": "band-x-walk",
    "name": "밴드 X 워크",
    "part": "lower"
  },
  {
    "id": "glute-activation-bridge",
    "name": "글루트 액티베이션 브릿지",
    "part": "lower"
  },
  {
    "id": "seated-band-abduction",
    "name": "시티드 밴드 어브덕션",
    "part": "lower"
  },
  {
    "id": "seated-band-pull-apart",
    "name": "시티드 밴드 풀어파트",
    "part": "shoulder"
  },
  {
    "id": "band-overhead-squat",
    "name": "밴드 오버헤드 스쿼트",
    "part": "core"
  },
  {
    "id": "lacrosse-ball-glute-release",
    "name": "라크로스볼 글루트 릴리즈",
    "part": "lower"
  },
  {
    "id": "lacrosse-ball-foot-release",
    "name": "라크로스볼 풋 릴리즈",
    "part": "lower"
  },
  {
    "id": "lacrosse-ball-pec-release",
    "name": "라크로스볼 페크 릴리즈",
    "part": "chest"
  },
  {
    "id": "neck-isometric-hold",
    "name": "넥 아이소메트릭 홀드",
    "part": "shoulder"
  },
  {
    "id": "band-ankle-dorsiflexion",
    "name": "밴드 앵클 도르시플렉션",
    "part": "lower"
  },
  {
    "id": "shoulder-flexion-stretch",
    "name": "숄더 플렉션 스트레치",
    "part": "shoulder"
  },
  {
    "id": "shoulder-extension-stretch",
    "name": "숄더 익스텐션 스트레치",
    "part": "shoulder"
  },
  {
    "id": "seated-thoracic-rotation",
    "name": "시티드 흉추 로테이션",
    "part": "back"
  },
  {
    "id": "neck-retraction",
    "name": "넥 리트랙션",
    "part": "shoulder"
  },
  {
    "id": "chin-tuck",
    "name": "친 턱",
    "part": "shoulder"
  },
  {
    "id": "prayer-stretch",
    "name": "프레이어 스트레치",
    "part": "arm"
  },
  {
    "id": "reverse-prayer-stretch",
    "name": "리버스 프레이어 스트레치",
    "part": "arm"
  },
  {
    "id": "finger-extension-stretch",
    "name": "핑거 익스텐션 스트레치",
    "part": "arm"
  },
  {
    "id": "dynamic-hip-flexor-stretch",
    "name": "다이나믹 힙 플렉서 스트레치",
    "part": "lower"
  },
  {
    "id": "dynamic-hamstring-stretch",
    "name": "다이나믹 햄스트링 스트레치",
    "part": "lower"
  },
  {
    "id": "dynamic-glute-stretch",
    "name": "다이나믹 글루트 스트레치",
    "part": "lower"
  },
  {
    "id": "ankle-circle",
    "name": "앵클 서클",
    "part": "lower"
  },
  {
    "id": "foot-arch-doming",
    "name": "풋 아치 도밍",
    "part": "lower"
  },
  {
    "id": "big-toe-extension",
    "name": "빅 토 익스텐션",
    "part": "lower"
  },
  {
    "id": "spinal-wave",
    "name": "스파인 와브",
    "part": "back"
  },
  {
    "id": "d-handle-cable-row",
    "name": "D핸들 케이블 로우",
    "part": "back"
  },
  {
    "id": "rope-cable-row",
    "name": "로프 케이블 로우",
    "part": "back"
  },
  {
    "id": "wide-bar-cable-row",
    "name": "와이드 바 케이블 로우",
    "part": "back"
  },
  {
    "id": "single-rope-cable-curl",
    "name": "싱글 로프 케이블 컬",
    "part": "arm"
  },
  {
    "id": "ez-bar-cable-pushdown",
    "name": "EZ바 케이블 푸시다운",
    "part": "arm"
  },
  {
    "id": "rope-cable-kickback",
    "name": "로프 케이블 킥백",
    "part": "arm"
  },
  {
    "id": "reverse-grip-ez-pushdown",
    "name": "리버스 그립 EZ 푸시다운",
    "part": "arm"
  },
  {
    "id": "straight-bar-face-pull",
    "name": "스트레이트 바 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "front-cable-shrug",
    "name": "프론트 케이블 슈러그",
    "part": "back"
  },
  {
    "id": "straight-bar-cable-pullover",
    "name": "스트레이트 바 케이블 풀오버",
    "part": "back"
  },
  {
    "id": "cable-rear-delt-row",
    "name": "케이블 리어 델트 로우",
    "part": "shoulder"
  },
  {
    "id": "wide-grip-cable-upright-row",
    "name": "와이드 그립 케이블 업라이트 로우",
    "part": "shoulder"
  },
  {
    "id": "cross-body-cable-raise",
    "name": "크로스보디 케이블 레이즈",
    "part": "shoulder"
  },
  {
    "id": "cable-deadlift",
    "name": "케이블 데드리프트",
    "part": "lower"
  },
  {
    "id": "ankle-strap-cable-hip-abduction",
    "name": "앵클 스트랩 케이블 힙 어브덕션",
    "part": "lower"
  },
  {
    "id": "cable-hip-flexion",
    "name": "케이블 힙 플렉션",
    "part": "lower"
  },
  {
    "id": "cable-knee-raise",
    "name": "케이블 니 레이즈",
    "part": "core"
  },
  {
    "id": "cable-lift",
    "name": "케이블 리프트",
    "part": "core"
  },
  {
    "id": "cable-twist",
    "name": "케이블 트위스트",
    "part": "core"
  },
  {
    "id": "cable-pull-apart",
    "name": "케이블 풀 어파트",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-z-press",
    "name": "덤벨 Z 프레스",
    "part": "shoulder"
  },
  {
    "id": "dumbbell-seesaw-press",
    "name": "덤벨 시소 프레스",
    "part": "shoulder"
  },
  {
    "id": "seated-arnold-press",
    "name": "시티드 아놀드 프레스",
    "part": "shoulder"
  },
  {
    "id": "alternating-incline-dumbbell-curl",
    "name": "얼터네이팅 인클라인 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "wide-dumbbell-curl",
    "name": "와이드 덤벨 컬",
    "part": "arm"
  },
  {
    "id": "dumbbell-skull-crusher",
    "name": "덤벨 스컬크러셔",
    "part": "arm"
  },
  {
    "id": "dumbbell-jm-press",
    "name": "덤벨 JM 프레스",
    "part": "arm"
  },
  {
    "id": "dumbbell-pullover-to-press",
    "name": "덤벨 풀오버 투 프레스",
    "part": "chest"
  },
  {
    "id": "cheat-curl",
    "name": "치트 컬",
    "part": "arm"
  },
  {
    "id": "barbell-7s-curl",
    "name": "바벨 7s 컬",
    "part": "arm"
  },
  {
    "id": "kettlebell-side-press",
    "name": "케틀벨 사이드 프레스",
    "part": "shoulder"
  },
  {
    "id": "kettlebell-bent-press",
    "name": "케틀벨 벤트 프레스",
    "part": "core"
  },
  {
    "id": "kettlebell-triceps-extension",
    "name": "케틀벨 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "kettlebell-concentration-curl",
    "name": "케틀벨 컨센트레이션 컬",
    "part": "arm"
  },
  {
    "id": "mace-360",
    "name": "메이스 360",
    "part": "core"
  },
  {
    "id": "mace-10-to-2",
    "name": "메이스 10 투 2",
    "part": "core"
  },
  {
    "id": "clubbell-swing",
    "name": "클럽벨 스윙",
    "part": "core"
  },
  {
    "id": "slam-ball-squat",
    "name": "슬램볼 스쿼트",
    "part": "lower"
  },
  {
    "id": "log-carry",
    "name": "통나무 캐리",
    "part": "core"
  },
  {
    "id": "keg-carry",
    "name": "케그 캐리",
    "part": "core"
  },
  {
    "id": "converging-incline-press-machine",
    "name": "컨버징 인클라인 프레스 머신",
    "part": "chest"
  },
  {
    "id": "converging-decline-press-machine",
    "name": "컨버징 디클라인 프레스 머신",
    "part": "chest"
  },
  {
    "id": "iso-lateral-incline-row",
    "name": "아이소레터럴 인클라인 로우",
    "part": "back"
  },
  {
    "id": "iso-lateral-front-pulldown",
    "name": "아이소레터럴 프론트 풀다운",
    "part": "back"
  },
  {
    "id": "iso-lateral-shoulder-press",
    "name": "아이소레터럴 숄더 프레스",
    "part": "shoulder"
  },
  {
    "id": "iso-lateral-leg-press",
    "name": "아이소레터럴 레그 프레스",
    "part": "lower"
  },
  {
    "id": "iso-lateral-low-row",
    "name": "아이소레터럴 로우 로우",
    "part": "back"
  },
  {
    "id": "iso-lateral-high-row",
    "name": "아이소레터럴 하이 로우",
    "part": "back"
  },
  {
    "id": "pendulum-leg-press",
    "name": "펜듈럼 레그 프레스",
    "part": "lower"
  },
  {
    "id": "belt-squat-machine",
    "name": "벨트 스쿼트 머신",
    "part": "lower"
  },
  {
    "id": "glute-ham-developer-machine",
    "name": "글루트 햄 디벨로퍼 머신",
    "part": "lower"
  },
  {
    "id": "horizontal-back-extension-machine",
    "name": "호리즌탈 백 익스텐션 머신",
    "part": "back"
  },
  {
    "id": "plate-loaded-seated-calf",
    "name": "플레이트 로디드 시티드 카프",
    "part": "lower"
  },
  {
    "id": "kneeling-leg-curl-machine",
    "name": "닐링 레그 컬 머신",
    "part": "lower"
  },
  {
    "id": "converging-row-machine",
    "name": "컨버징 로우 머신",
    "part": "back"
  },
  {
    "id": "plate-loaded-preacher-curl",
    "name": "플레이트 로디드 프리처 컬",
    "part": "arm"
  },
  {
    "id": "machine-lying-triceps-extension",
    "name": "머신 라잉 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "vertical-chest-press-machine",
    "name": "버티컬 체스트 프레스 머신",
    "part": "chest"
  },
  {
    "id": "low-pulley-row-machine",
    "name": "로우 풀리 로우 머신",
    "part": "back"
  },
  {
    "id": "elevated-pike-push-up",
    "name": "엘리베이티드 파이크 푸시업",
    "part": "shoulder"
  },
  {
    "id": "fingertip-push-up",
    "name": "핑거팁 푸시업",
    "part": "chest"
  },
  {
    "id": "knuckle-push-up",
    "name": "너클 푸시업",
    "part": "chest"
  },
  {
    "id": "typewriter-push-up",
    "name": "타입라이터 푸시업",
    "part": "chest"
  },
  {
    "id": "slider-push-up",
    "name": "슬라이더 푸시업",
    "part": "chest"
  },
  {
    "id": "slider-fly",
    "name": "슬라이더 플라이",
    "part": "chest"
  },
  {
    "id": "slider-knee-tuck",
    "name": "슬라이더 니 턱",
    "part": "core"
  },
  {
    "id": "ring-muscle-up",
    "name": "링 머슬업",
    "part": "core"
  },
  {
    "id": "ring-row",
    "name": "링 로우",
    "part": "back"
  },
  {
    "id": "ring-pull-up",
    "name": "링 풀업",
    "part": "back"
  },
  {
    "id": "ring-face-pull",
    "name": "링 페이스 풀",
    "part": "shoulder"
  },
  {
    "id": "ring-triceps-extension",
    "name": "링 트라이셉스 익스텐션",
    "part": "arm"
  },
  {
    "id": "ring-biceps-curl",
    "name": "링 비셉스 컬",
    "part": "arm"
  },
  {
    "id": "single-leg-box-squat",
    "name": "싱글 레그 박스 스쿼트",
    "part": "lower"
  },
  {
    "id": "wall-sit-march",
    "name": "월 싯 마치",
    "part": "lower"
  },
  {
    "id": "step-calf-raise",
    "name": "스텝 카프 레이즈",
    "part": "lower"
  },
  {
    "id": "lying-leg-raise",
    "name": "라잉 레그 레이즈",
    "part": "core"
  },
  {
    "id": "heel-touch",
    "name": "힐 터치",
    "part": "core"
  },
  {
    "id": "dead-bug-extension",
    "name": "데드버그 익스텐션",
    "part": "core"
  },
  {
    "id": "quadruped-hip-extension",
    "name": "쿼드러페드 힙 익스텐션",
    "part": "lower"
  },
  {
    "id": "knee-to-chest-stretch",
    "name": "니 투 체스트 스트레치",
    "part": "lower"
  },
  {
    "id": "double-knee-to-chest",
    "name": "더블 니 투 체스트",
    "part": "back"
  },
  {
    "id": "lying-glute-stretch",
    "name": "라잉 글루트 스트레치",
    "part": "lower"
  },
  {
    "id": "standing-it-band-stretch",
    "name": "스탠딩 IT밴드 스트레치",
    "part": "lower"
  },
  {
    "id": "straddle-stretch",
    "name": "스트래들 스트레치",
    "part": "lower"
  },
  {
    "id": "side-split-stretch",
    "name": "사이드 스플릿 스트레치",
    "part": "lower"
  },
  {
    "id": "front-split-stretch",
    "name": "프론트 스플릿 스트레치",
    "part": "lower"
  },
  {
    "id": "step-calf-stretch",
    "name": "스텝 카프 스트레치",
    "part": "lower"
  },
  {
    "id": "scalene-neck-stretch",
    "name": "스케일렌 넥 스트레치",
    "part": "shoulder"
  },
  {
    "id": "pec-minor-stretch",
    "name": "펙 마이너 스트레치",
    "part": "chest"
  },
  {
    "id": "biceps-stretch",
    "name": "바이셉스 스트레치",
    "part": "arm"
  },
  {
    "id": "finger-stretch",
    "name": "핑거 스트레치",
    "part": "arm"
  },
  {
    "id": "standing-back-extension-stretch",
    "name": "스탠딩 백 익스텐션 스트레치",
    "part": "back"
  },
  {
    "id": "side-reaching-child-s-pose",
    "name": "사이드 리칭 차일드 포즈",
    "part": "back"
  },
  {
    "id": "seated-side-stretch",
    "name": "시티드 사이드 스트레치",
    "part": "core"
  },
  {
    "id": "kneeling-hamstring-stretch",
    "name": "닐링 햄스트링 스트레치",
    "part": "lower"
  },
  {
    "id": "side-lying-quad-stretch",
    "name": "사이드 라잉 쿼드 스트레치",
    "part": "lower"
  },
  {
    "id": "foam-roller-tfl-release",
    "name": "폼롤러 TFL 릴리즈",
    "part": "lower"
  },
  {
    "id": "foam-roller-pec-release",
    "name": "폼롤러 펙 릴리즈",
    "part": "chest"
  },
  {
    "id": "foam-roller-erector-release",
    "name": "폼롤러 척추기립근 릴리즈",
    "part": "back"
  }
];

const BY_ID = new Map(ADMIN_EXERCISES.map((e) => [e.id, e]));
export function getAdminExercise(id: string): AdminExercise | undefined {
  return BY_ID.get(id);
}
