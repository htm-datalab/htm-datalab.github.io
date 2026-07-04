/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://htm-analysis.github.io",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // 메타데이터 라우트(파비콘)는 사이트맵에서 제외
  exclude: ["/icon.svg"],
  // 정적 export 산출물(out/)에 직접 생성
  outDir: "out",
  trailingSlash: true,
};
