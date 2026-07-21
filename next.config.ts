import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // service_role 키를 다루는 서버 전용 앱이라 소스맵 노출을 막는다.
  productionBrowserSourceMaps: false,
};

export default nextConfig;