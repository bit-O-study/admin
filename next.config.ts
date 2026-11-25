import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // service_role 키를 다루는 서버 전용 앱이라 소스맵 노출을 막는다.
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      // 서버 액션 기본 한도는 1MB 라 위스키 이미지가 1MB 만 넘어도 실패했다.
      // 이미지 한도는 4MB(liquor/actions.ts MAX_IMAGE_BYTES) — Vercel 함수 요청 본문 한도 4.5MB 안쪽.
      // multipart 오버헤드를 위해 여기는 5MB. 더 큰 원본이 필요하면 Storage 서명 URL 직접 업로드로 바꾼다.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
