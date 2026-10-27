// 운영 도메인은 Vercel 프로젝트 설정에서 확인한 주소다. 내부 서버 주소와 구분한다.
export const projectSites = [
  { key: "MeetingMinutes", name: "메모 moa", description: "프로젝트 메모 · 일정 · 자료실", url: "https://meeting-minutes-orcin.vercel.app", port: 4105 },
  { key: "health_app", name: "헬쑤", description: "운동 기록 · 코칭", url: "https://health-app-five-iota.vercel.app", port: 4100 },
  { key: "whisky_app", name: "위스키", description: "상품 · 가격 비교", url: "https://whisky-app-vert.vercel.app", port: 4103 },
  { key: "trip", name: "여행", description: "여행 일정 · 계획", url: "https://trip-planner-tau-jade.vercel.app", port: 4102 },
  { key: "iq", name: "아이큐", description: "문제 · 검사", url: "https://iq-test-fuyo-pi.vercel.app", port: null },
  { key: "admin", name: "통합 관리자", description: "프로젝트 운영 · 파일 검수", url: "https://heltch-admin.vercel.app", port: 4101 },
  { key: "accountBook", name: "가계부", description: "가계부 관리", url: null, port: 4104 },
  { key: "ticket", name: "티켓", description: "티켓 도구 · 확장 프로그램", url: null, port: 4106 },
  { key: "ast", name: "AST", description: "모의 트레이딩 대시보드", url: null, port: 8787 },
] as const;
