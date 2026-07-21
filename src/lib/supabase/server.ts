import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 관리자 로그인/세션용 Supabase 클라이언트 (= 헬스앱 프로젝트).
 * 쿠키의 access/refresh 토큰으로 세션을 복원하며, 관리자 판별(admins 테이블 RLS)에 쓴다.
 * 실제 사이트 데이터 접근은 이 클라이언트가 아니라 lib/supabase/admin-clients.ts 의
 * service_role 클라이언트로 한다.
 */
// env 는 함수 안에서 확인(지연) — 모듈 로드 시 throw 하면 env 미설정 상태에서
// `next build` 가 깨진다. 실제 사용 시점에만 검증한다.
export const createSupabaseServerClient = cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
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