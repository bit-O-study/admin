import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * 관리자 로그인/세션용 Supabase 클라이언트 (= 헬스앱 프로젝트).
 * 쿠키의 access/refresh 토큰으로 세션을 복원하며, 관리자 판별(admins 테이블 RLS)에 쓴다.
 * 실제 사이트 데이터 접근은 이 클라이언트가 아니라 lib/supabase/admin-clients.ts 의
 * service_role 클라이언트로 한다.
 */
export const createSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트에서 호출되면 set 이 막힐 수 있음 — 세션 갱신은 미들웨어가 담당.
        }
      },
    },
  });
});

/** 현재 로그인 사용자(없으면 null). stale 쿠키로 인한 throw 를 삼켜 비로그인 처리. */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});