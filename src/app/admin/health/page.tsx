import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// 헬쑤앱 대시보드 그래프는 바깥(통합) 대시보드(/admin)로 이동했다.
// 헬쑤앱 그룹의 기본 진입은 회원정보로 보낸다.
export default function HealthHome() {
  redirect("/admin/health/members");
}