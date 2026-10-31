// 운영 주소(2026-10-31): helthssu.co.kr 도메인(서버 Cloudflare 터널). 아이큐만 서버에 없어 Vercel 주소.
export const projectSites = [
  { key: "MeetingMinutes", name: "메모 moa", description: "프로젝트 메모 · 일정 · 자료실", url: "https://memo.helthssu.co.kr", port: 4105 },
  { key: "health_app", name: "헬쑤", description: "운동 기록 · 코칭", url: "https://www.helthssu.co.kr", port: 4100 },
  { key: "whisky_app", name: "위스키", description: "상품 · 가격 비교", url: "https://whisky.helthssu.co.kr", port: 4103 },
  { key: "trip", name: "여행", description: "여행 일정 · 계획", url: "https://trip.helthssu.co.kr", port: 4102 },
  { key: "iq", name: "아이큐", description: "문제 · 검사", url: "https://iq-test-fuyo-pi.vercel.app", port: null },
  { key: "admin", name: "통합 관리자", description: "프로젝트 운영 · 파일 검수", url: "https://admin.helthssu.co.kr", port: 4101 },
  { key: "accountBook", name: "가계부", description: "가계부 관리", url: "https://account.helthssu.co.kr", port: 4104 },
  { key: "ticket", name: "티켓", description: "티켓 도구 · 확장 프로그램", url: "https://ticket.helthssu.co.kr", port: 4106 },
  { key: "ast", name: "AST", description: "모의 트레이딩 대시보드", url: null, port: 8787 },
] as const;
