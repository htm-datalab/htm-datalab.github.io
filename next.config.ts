import type { NextConfig } from "next";

// GitHub Pages(유저/조직 루트 페이지) 정적 배포 전제.
// 아래 3개 옵션은 CLAUDE.md 6장 참조 — 변경 시 배포가 깨진다.
// basePath/assetPrefix는 조직 루트 페이지(htm-datalab.github.io)이므로 설정하지 않는다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
