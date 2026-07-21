import { redirect } from "next/navigation";

// 루트 진입 → 관리자 홈. 비로그인/비관리자는 미들웨어가 /login 으로 보낸다.
export default function RootPage() {
  redirect("/admin");
}