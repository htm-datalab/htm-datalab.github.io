# Team. 혜빈이택한민정 — 포트폴리오 사이트

대학생 데이터 분석 팀의 포트폴리오 + 블로그.
**Next.js 정적 사이트**로, GitHub Pages(`https://htm-datalab.github.io`)에 자동 배포됩니다.

> ⚠️ **시작 전 필독**: 이 레포는 공개입니다. 실데이터·개인정보·시크릿 커밋 금지.
> 규칙은 [`CLAUDE.md`](./CLAUDE.md), 디자인 규칙은 [`design.md`](./design.md) 참조.
> 현재 모든 콘텐츠는 `[MOCK]` 표시된 예시입니다 — 교체 지점은 `[MOCK]` 또는 `TODO: replace`로 검색하세요.

---

## 1. 새 글 추가하는 법 (개발 지식 불필요)

게시물은 전부 `content/` 폴더의 파일입니다. **파일을 추가하고 main에 푸시하면 자동으로 배포**됩니다.

### 블로그 글 쓰기

`content/blog/` 폴더에 `YYYY-MM-DD-제목영문.mdx` 파일을 만듭니다.
**파일명이 곧 URL**이 됩니다 (`2026-07-10-my-post.mdx` → `/blog/2026-07-10-my-post/`).

파일 맨 위에 아래 형식(프론트매터)을 채우고, 그 아래에 마크다운으로 본문을 씁니다:

```mdx
---
title: "글 제목"
date: "2026-07-10"
summary: "목록 카드에 보이는 1~2문장 요약"
tags: ["미팅", "회고"]
author: "혜빈"
---

여기부터 본문. 일반 마크다운 문법 그대로 사용.

## 소제목

**굵게**, [링크](https://example.com), 목록, 표, 코드블록 전부 됩니다.
```

본문에서 쓸 수 있는 특수 블록:

```mdx
<Callout type="note" title="참고">일반 안내 상자</Callout>
<Callout type="insight" title="발견">노란 형광펜 강조 상자 (핵심 발견에만)</Callout>
<TableauEmbed url="https://public.tableau.com/views/..." title="대시보드 이름" />
```

주의: 본문에 HTML 주석(`<!-- -->`)은 쓸 수 없습니다. 주석은 `{/* 이렇게 */}`.

### 글에 사진 넣기

```bash
npm run add-image -- "사진.jpg" --to blog --name my-post-photo
```

EXIF 제거·리사이즈·webp 변환 후 출력되는 마크다운 줄(`![설명](/images/blog/my-post-photo.webp)`)을 본문에 붙여넣으면 됩니다.

### Notion으로 블로그 쓰기 (개발 지식 불필요)

MDX 파일 대신 **Notion 데이터베이스에 글을 쓰고 명령 하나로 동기화**할 수 있습니다.

흐름: Notion DB에 글 작성 → **발행** 체크박스 체크 → `npm run sync-notion` 실행 → `git diff`로 결과 확인 → commit & push.
(정적 사이트라 실시간 연동은 안 되고, 로컬에서 명령을 실행해야 사이트에 반영됩니다.)

**최초 1회 설정**:

1. https://www.notion.so/my-integrations 에서 integration을 만듭니다 (Internal, 워크스페이스 선택).
2. 블로그 DB 페이지 우측 상단 `⋯` → **연결(Connections)** → 방금 만든 integration을 추가합니다.
3. 레포 루트에 `.env.local` 파일을 만들고 아래처럼 토큰을 저장합니다:
   ```
   NOTION_TOKEN=ntn_...
   ```
   > ⚠️ **이 토큰은 절대 커밋하거나 다른 곳에 붙여넣지 마세요.** `.env.local`은 `.gitignore`에 등록되어 있어 커밋되지 않지만, 실수로 코드나 채팅에 붙여넣지 않도록 주의하세요 (이 레포는 공개입니다).

**DB에 아래 속성을 정확한 한글 이름으로 만듭니다**:

| 속성 이름 | 타입 | 설명 |
| --- | --- | --- |
| 제목 | 제목(title) | 글 제목 |
| 날짜 | 날짜(date) | 게시일 |
| 요약 | 텍스트(rich text) | 목록 카드에 보이는 1~2문장 요약 |
| 태그 | 다중 선택(multi-select) | 목록 카드 태그 |
| 작성자 | 선택(select) | 작성자 이름 |
| 슬러그 | 텍스트(rich text) | URL에 쓰일 영문. 소문자·숫자·하이픈만 (예: `my-post-title`) |
| 발행 | 체크박스(checkbox) | **체크된 글만 동기화됩니다.** 체크 해제하면 사이트에서 내려갑니다 |

**사용법**:

```bash
npm run sync-notion -- --dry-run   # 먼저 변경 계획만 확인
npm run sync-notion                # 실제로 content/blog/*.mdx 생성·수정·삭제
```

Notion에 쓴 사진은 자동으로 다운로드·webp 변환(EXIF 제거)되어 `public/images/blog/`에 저장됩니다.
`손글(Notion 없이 직접 만든 .mdx)` 게시물은 sync가 절대 건드리지 않습니다.

**Notion에서 쓰는 법 → 사이트에서 보이는 모습**:

| Notion에서 | 사이트에서 |
| --- | --- |
| 콜아웃 블록 (💡 아이콘) | 노란 형광펜 강조 상자 (`<Callout type="insight">`) |
| 콜아웃 블록 (다른 아이콘) | 일반 안내 상자 (`<Callout type="note">`) |
| 텍스트에 노란 배경 하이라이트 | 형광펜 밑줄 강조 (`<Highlight>`) |
| Tableau Public 링크 | 대시보드 임베드 (`<TableauEmbed>`) |
| 사진 | 자동 다운로드·변환 후 삽입 |
| 표, 인용, 코드블록, 토글, 목록, 제목 | 그대로 지원 |
| 파일 첨부·페이지 링크 등 그 외 블록 | 지원하지 않아 일반 텍스트로 변환 (경고 출력) |

### 프로젝트 내용 수정

`content/projects/<프로젝트폴더>/` 안의 파일을 수정합니다:

| 파일 | 내용 |
| --- | --- |
| `index.mdx` | 카드에 보이는 정보 (제목·클라이언트·기간·요약·태그) |
| `01-overview.mdx` | 분석 개요 섹션 |
| `02-analysis.mdx` | 데이터 분석 섹션 |
| `03-insights.mdx` | 인사이트·결과 섹션 |

새 프로젝트는 폴더를 하나 더 만들면 됩니다 (같은 구조로). `index.mdx`의 `order`가 "의뢰 NN" 번호가 됩니다.

### 미팅 기록 추가

`content/data/meetings.json`에 항목 하나를 추가합니다:

```json
{
  "date": "2026-07-11",
  "title": "임팩트 리포트 중간 공유",
  "memo": "한 줄 메모",
  "type": "클라이언트",
  "done": true
}
```

`type`은 자유 라벨 (킥오프/정기/클라이언트/체험 등), `done: false`면 예정 항목(빈 도트)으로 표시.

### 갤러리 사진 추가

1. 아래 명령으로 사진을 변환합니다 (png/jpg/jpeg/webp 지원, **gif는 지원하지 않음**, svg는 벡터라 변환 불필요 — `public/images/gallery/`에 직접 복사):

   ```bash
   npm run add-image -- "사진경로.jpg" --to gallery
   ```

   자동으로 처리되는 것: **EXIF(위치정보 등) 제거**(CLAUDE.md 3장 필수 요건), 긴 변 1600px로 리사이즈, **webp로 변환**. 원본 컬러 그대로 유지됩니다 (흑백 변환 금지 — 사이트가 CSS로 처리).
   이미 같은 이름의 파일이 있으면 `--name 다른이름`으로 바꾸거나 `--force`로 덮어쓰세요.

2. 명령 실행 후 터미널에 출력되는 JSON 스니펫을 복사해 `content/data/gallery.json` 배열에 붙여넣고, `alt`/`caption`/`tags`를 채웁니다:

   ```json
   {
     "src": "/images/gallery/파일명.webp",
     "alt": "스크린리더용 사진 설명",
     "caption": "사진 아래 캡션",
     "tags": ["체험", "마르쉐"],
     "date": "2026-07-11"
   }
   ```

(참고) 스크립트 없이 수동으로 하려면: 탐색기에서 사진 우클릭 → 속성 → 자세히 → "속성 및 개인 정보 제거"로 EXIF를 지운 뒤 300KB 이하로 직접 줄여서 넣어도 됩니다.

### 팀원 정보 수정

`content/data/members.json`. 사진은 `npm run add-image -- "사진.jpg" --to team --name 이름`으로 변환한 뒤, 출력된 `photo`/`alt` 필드를 해당 팀원 항목에 붙여넣습니다.

---

## 2. 로컬 미리보기

처음 한 번:

```bash
git clone https://github.com/htm-datalab/htm-datalab.github.io.git
cd htm-datalab.github.io
npm install
git config core.hooksPath .githooks   # 커밋 전 보안 검사 훅 켜기 (필수)
```

미리보기 서버:

```bash
npm run dev
# → http://localhost:3000 에서 확인. 파일 저장하면 자동 반영.
```

배포와 동일한 결과물 확인(선택):

```bash
npm run build   # out/ 폴더에 정적 사이트 생성 + sitemap 생성
```

---

## 3. 배포 절차

**main 브랜치에 푸시하면 끝**입니다. GitHub Actions가 자동으로 빌드하고 Pages에 배포합니다 (1~2분 소요).

```bash
git add content/blog/2026-07-10-my-post.mdx
npm run check-secrets       # 훅을 켰다면 커밋 시 자동 실행됨
git commit -m "블로그: 7월 정기회의 후기"
git push
```

- 진행 상황: GitHub 레포 → Actions 탭
- 실패 시: Actions 로그 확인 → 대부분 프론트매터 오타(따옴표·콜론) 문제

### 최초 1회 설정 (레포 만들 때)

1. GitHub에 `htm-datalab` 조직 아래 **`htm-datalab.github.io`** 이름으로 public 레포 생성
2. 레포 Settings → Pages → Source를 **GitHub Actions**로 변경
3. 이 프로젝트를 push → 자동 배포 시작

---

## 4. 구조 한눈에

```
content/          ← 팀원이 편집하는 곳 (글·데이터)
  blog/           블로그 글 (.mdx)
  projects/       프로젝트 본문 (.mdx)
  data/           members / meetings / gallery (.json)
public/images/    사진 (EXIF 제거 후 업로드)
src/              사이트 코드 (디자인 변경 시에만)
design.md         디자인 규칙
CLAUDE.md         보안·운영 규칙 (필독)
```

## 5. 기술 스택

Next.js 16 (App Router, `output: 'export'`) · TypeScript · Tailwind CSS 4 · Motion · Lenis ·
next-mdx-remote + gray-matter · rehype-pretty-code(Shiki) · next-sitemap · GitHub Actions → GitHub Pages
