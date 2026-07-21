import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 매 요청마다 세션을 갱신하고, 관리자 콘솔(/admin, /)을 게이트한다.
 *  - 비로그인 → /login
 *  - 로그인했지만 admins 아님 → /login?denied=1  (로그인 화면에서 서버액션이 최종 판정도 함)
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // env 미설정(첫 배포 등) — 게이트를 걸 수 없으니 통과시킨다. 로그인 화면에서 안내.
  if (!supabaseUrl || !supabaseKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let user = null;
  let authErrored = false;
  try {
    const res = await supabase.auth.getUser();
    user = res.data.user ?? null;
    authErrored = !!res.error;
  } catch {
    authErrored = true;
  }
  if (!user && authErrored) {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      /* 무시 */
    }
    user = null;
  }

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";

  // 로그인 화면은 게이트에서 제외(무한 리다이렉트 방지).
  if (isLogin) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 프리페치는 admins 조회를 생략(부하↓). 실제 네비게이션 때 판정.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";
  if (!isPrefetch) {
    let isAdmin = false;
    try {
      // RLS: 관리자면 admins 행 조회 가능, 아니면 0행.
      const { data } = await supabase.from("admins").select("email").limit(1);
      isAdmin = (data?.length ?? 0) > 0;
    } catch {
      isAdmin = false;
    }
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("denied", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}