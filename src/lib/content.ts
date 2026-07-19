// 콘텐츠 로더 — 빌드 타임 전용 (서버 컴포넌트/generateStaticParams에서만 사용).
// 모든 게시물·데이터는 /content 아래 MDX·JSON 파일로 관리한다 (CLAUDE.md 6장).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ───────────────── 프로젝트 ───────────────── */

export type ProjectMeta = {
  slug: string;
  /** 실제 의뢰 순번 — 카드의 "의뢰 01" 라벨에 쓰인다 */
  order: number;
  title: string;
  client: string;
  clientType: string;
  period: string;
  summary: string;
  tags: string[];
  status: string;
};

export type ProjectSection = {
  /** 파일명에서 유도 (01-overview.mdx → overview). 페이지 앵커 id로 쓰인다 */
  id: string;
  title: string;
  body: string;
};

export type Project = {
  meta: ProjectMeta;
  sections: ProjectSection[];
};

const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");

export function getProjectSlugs(): string[] {
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function readProjectMeta(slug: string): ProjectMeta {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, slug, "index.mdx"), "utf8");
  const { data } = matter(raw);
  return {
    slug,
    order: data.order ?? 99,
    title: data.title ?? slug,
    client: data.client ?? "",
    clientType: data.clientType ?? "",
    period: data.period ?? "",
    summary: data.summary ?? "",
    tags: data.tags ?? [],
    status: data.status ?? "",
  };
}

export function getProjects(): ProjectMeta[] {
  return getProjectSlugs()
    .map(readProjectMeta)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project {
  const dir = path.join(PROJECTS_DIR, slug);
  const sectionFiles = fs
    .readdirSync(dir)
    .filter((f) => /^\d+-.+\.mdx$/.test(f))
    .sort();

  const sections = sectionFiles.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    return {
      id: file.replace(/^\d+-/, "").replace(/\.mdx$/, ""),
      title: (data.title as string) ?? "",
      body: content,
    };
  });

  return { meta: readProjectMeta(slug), sections };
}

/* ───────────────── 블로그 ───────────────── */

export type BlogPostMeta = {
  /** 파일명이 곧 slug (확장자 제외) */
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  author: string;
};

export type BlogPost = {
  meta: BlogPostMeta;
  body: string;
};

const BLOG_DIR = path.join(CONTENT_DIR, "blog");

export function getBlogSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

function resolveBlogFile(slug: string): string {
  const mdx = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(mdx)) return mdx;
  return path.join(BLOG_DIR, `${slug}.md`);
}

export function getBlogPost(slug: string): BlogPost {
  const raw = fs.readFileSync(resolveBlogFile(slug), "utf8");
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      summary: data.summary ?? "",
      tags: data.tags ?? [],
      author: data.author ?? "",
    },
    body: content,
  };
}

export function getBlogPosts(): BlogPostMeta[] {
  return getBlogSlugs()
    .map((slug) => getBlogPost(slug).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ───────────────── JSON 데이터 (팀원·미팅·갤러리) ───────────────── */

export type Member = {
  name: string;
  role: string;
  isMentor?: boolean;
  intro: string;
  focus: string[];
  photo: string;
  alt: string;
};

export type Meeting = {
  date: string;
  title: string;
  memo: string;
  /** 킥오프 | 정기 | 클라이언트 | 체험 등 자유 라벨 */
  type: string;
  done: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryItem = {
  images: GalleryImage[];
  caption: string;
  tags: string[];
  date: string;
};

/** gallery.json 원본 항목 — 단일 이미지(src/alt) 또는 여러 이미지(images) 형태를 모두 허용 */
type GalleryItemRaw =
  | { src: string; alt: string; caption: string; tags: string[]; date: string }
  | { images: GalleryImage[]; caption: string; tags: string[]; date: string };

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "data", file), "utf8")) as T;
}

export function getMembers(): Member[] {
  return readJson<Member[]>("members.json");
}

export function getMeetings(): Meeting[] {
  // 최신이 위로
  return readJson<Meeting[]>("meetings.json").sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGalleryItems(): GalleryItem[] {
  return readJson<GalleryItemRaw[]>("gallery.json")
    .map(
      (item): GalleryItem =>
        "images" in item ? item : { ...item, images: [{ src: item.src, alt: item.alt }] },
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
