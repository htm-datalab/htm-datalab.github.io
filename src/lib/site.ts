// 사이트 전역 설정 — 콘텐츠가 아닌 "사이트 정체성" 값만 둔다.
export const site = {
  name: "Team. 혜빈이택한민정",
  shortName: "혜빈이택한민정",
  url: "https://htm-analysis.github.io",
  description:
    "사회적 기업과 NGO의 데이터를 분석하는 대학생 데이터 분석 팀. 숫자 더미에서 형광펜 그을 한 줄을 찾습니다.",
  // [MOCK] TODO: replace — 팀 대표 이메일로 교체 (개인 이메일 금지, CLAUDE.md 3장)
  email: "htm-analysis@example.com",
  // [MOCK] TODO: replace — 실제 GitHub 조직 주소 확인 후 교체
  github: "https://github.com/HTM-analysis",
} as const;
