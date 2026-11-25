import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * 매 요청마다 세션을 갱신하고, 비로그인이면 /login 으로 보낸다.
 *
 * 관리자(admins) 판정은 여기서 하지 않는다 — 서버 쪽 한 곳(features/admin/admin.ts 의
 * isAdminUser, 요청당 1회 cache)에서 레이아웃·데이터 함수(requireAdmin)·서버 액션이 판정한다.
 * 예전엔 미들웨어와 레이아웃이 auth·admins 를 각각 조회했고(화면 이동마다 2번),
 * prefetch 요청은 미들웨어가 admins 확인을 건너뛰어 '미들웨어가 막아 준다'는 가정이 틀려 있었다.
 *
 * getClaims: 쿠키의 JWT 서명을 확인한다(만료면 refresh). 비대칭 키 프로젝트면 auth 서버 왕복이 없다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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

  let signedIn = false;
  let authErrored = false;
  try {
    const res = await supabase.auth.getClaims();
    signedIn = Boolean(res.data?.claims?.sub);
    authErrored = !!res.error;
  } catch {
    authErrored = true;
  }
  if (!signedIn && authErrored) {
    try {
      // 깨진·만료된 쿠키만 이 브라우저에서 지운다(다른 기기 세션은 건드리지 않음).
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      /* 무시 */
    }
  }

  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/login";

  // 로그인 화면은 게이트에서 제외(무한 리다이렉트 방지).
  if (isLogin) return response;

  if (!signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    // 로그인 후 돌아갈 곳 — 로그인 액션이 safeRedirectPath 로 다시 검증한다.
    url.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return response;
}
