// Notion 데이터베이스 → content/blog/*.mdx 동기화 CLI.
// 흐름: Notion에 글 작성 → "발행" 체크 → npm run sync-notion → git diff 검토 → commit/push.
// 토큰은 .env.local의 NOTION_TOKEN에서만 읽는다 (절대 커밋 금지 — CLAUDE.md 4장).
//
// 사용법: npm run sync-notion -- [--dry-run] [--force]
import { parseArgs } from "node:util";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@notionhq/client";
import matter from "gray-matter";
import sharp from "sharp";

// libvips의 파일 캐시를 끈다 — 켜져 있으면 Windows에서 방금 쓴 webp 파일의
// mmap 핸들이 남아 재sync 시 정리(unlink)가 EBUSY로 실패할 수 있다.
sharp.cache(false);

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const BLOG_DIR = path.join(REPO_ROOT, "content", "blog");
const IMG_DIR = path.join(REPO_ROOT, "public", "images", "blog");
const DATABASE_ID = "3996e91642ce80bd9a2af38491a122e1";
const MAX_DIMENSION = 1600;

// Notion DB 속성 스키마 — 이 이름/타입 그대로 DB에 만들어야 한다 (README 참조).
const PROPS = {
  title: { name: "제목", type: "title" },
  date: { name: "날짜", type: "date" },
  summary: { name: "요약", type: "rich_text" },
  tags: { name: "태그", type: "multi_select" },
  author: { name: "작성자", type: "select" },
  slug: { name: "슬러그", type: "rich_text" },
  published: { name: "발행", type: "checkbox" },
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const GITIGNORE_TRAP = /^(secret|credentials)|token/i;

// Notion의 "enhanced markdown"이 쓰는 XML풍 태그 중, MDX로 그대로 넘겨도 안전한 것들
// (표준 HTML 요소이거나 이 사이트 MDX 컴포넌트). 나머지는 태그를 벗기고 내용만 남긴다.
const MDX_SAFE_TAGS = new Set([
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "colgroup",
  "col",
  "details",
  "summary",
  "video",
  "audio",
  "br",
  "Callout",
  "Highlight",
  "TableauEmbed",
]);

export function printUsage() {
  console.log(`사용법:
  npm run sync-notion -- [--dry-run] [--force]

옵션:
  --dry-run   변경 계획만 출력하고 실제로 쓰지 않음 (이미지 다운로드도 하지 않음)
  --force     Notion에서 변경이 없어도 강제로 다시 생성

흐름:
  Notion DB에 글 작성 → "발행" 체크 → npm run sync-notion -- --dry-run으로 미리보기
  → npm run sync-notion → git diff 검토 → commit & push

DB 속성 (정확한 한글 이름으로 만들어야 함):
  제목(title) / 날짜(date) / 요약(rich_text) / 태그(multi_select)
  작성자(select) / 슬러그(rich_text, 영문-소문자-하이픈) / 발행(checkbox)`);
}

/* ───────────────── Notion 속성값 추출 ───────────────── */

function plainText(richTextArray) {
  return (richTextArray ?? []).map((r) => r.plain_text).join("");
}

function readProp(page, key) {
  const cfg = PROPS[key];
  const prop = page.properties[cfg.name];
  if (!prop) return undefined;
  switch (cfg.type) {
    case "title":
      return plainText(prop.title);
    case "rich_text":
      return plainText(prop.rich_text);
    case "multi_select":
      return (prop.multi_select ?? []).map((o) => o.name);
    case "select":
      return prop.select?.name;
    case "checkbox":
      return !!prop.checkbox;
    case "date":
      return prop.date?.start;
    default:
      return undefined;
  }
}

export function slugFromFilename(filename) {
  return filename.replace(/\.mdx?$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

/* ───────────────── 마크다운 후처리 (MDX 안전화 + 컴포넌트 매핑) ───────────────── */

function parseTagAttrs(attrString) {
  const attrs = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(attrString))) attrs[m[1]] = m[2];
  return attrs;
}

export function dedent(text) {
  const lines = text.split("\n");
  const indents = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^[\t ]*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}

// Notion 전용 힌트 속성(color/fit-page-width 등)은 이 사이트 CSS에 대응이 없어 제거.
function stripNotionOnlyAttrs(md) {
  return md
    .replace(/<table[^>]*>/g, "<table>")
    .replace(/<tr[^>]*>/g, "<tr>")
    .replace(/<td[^>]*>/g, "<td>")
    .replace(/<th[^>]*>/g, "<th>")
    .replace(/<colgroup[^>]*>/g, "<colgroup>")
    .replace(/<col[^>]*\/?>/g, "<col>")
    .replace(/<details[^>]*>/g, "<details>");
}

// <callout icon="💡" color="yellow">\n\t내용\n</callout> → <Callout type="insight">내용</Callout>
function transformCallouts(md) {
  return md.replace(
    /<callout([^>]*)>\n([\s\S]*?)\n<\/callout>/g,
    (_whole, attrString, inner) => {
      const { icon = "" } = parseTagAttrs(attrString);
      const type = /[💡⭐✨🌟]/u.test(icon) ? "insight" : "note";
      return `<Callout type="${type}">\n\n${dedent(inner)}\n\n</Callout>`;
    },
  );
}

// <span color="yellow_bg">텍스트</span> → <Highlight>텍스트</Highlight> (사이트 시그니처 형광펜)
// 그 외 색상은 이 사이트 디자인에 없으므로 뒤이은 unwrapUnknownTags에서 일반 텍스트로 벗겨진다.
function transformHighlightSpans(md) {
  return md.replace(/<span color="yellow_bg">([\s\S]*?)<\/span>/g, "<Highlight>$1</Highlight>");
}

// public.tableau.com 링크(마크다운 링크 또는 단독 URL 줄) → <TableauEmbed>
function transformTableauLinks(md) {
  return md
    .replace(
      /\[([\s\S]*?)\]\((https?:\/\/public\.tableau\.com\/[^\s)]+)\)/g,
      (_w, caption, url) => `<TableauEmbed url="${url}" title="${caption || "Tableau 대시보드"}" />`,
    )
    .replace(
      /^(https?:\/\/public\.tableau\.com\/\S+)$/gm,
      (_w, url) => `<TableauEmbed url="${url}" title="Tableau 대시보드" />`,
    );
}

// 위 변환들이 처리하지 못한 나머지 XML풍 태그(<file>, <page>, <database>, <columns> 등)를
// 안전망으로 벗겨낸다 — 태그는 버리고 안의 텍스트만 남긴다.
function unwrapUnknownTags(md, warnings) {
  let out = md.replace(
    /<([a-zA-Z][\w-]*)\b([^>]*)>([\s\S]*?)<\/\1>/g,
    (whole, tag, _attrs, inner) => {
      if (MDX_SAFE_TAGS.has(tag)) return whole;
      warnings.push(`지원하지 않는 태그 <${tag}>를 일반 텍스트로 바꿨습니다.`);
      return inner;
    },
  );
  out = out.replace(/<([a-zA-Z][\w-]*)\b([^>]*)\/>/g, (whole, tag) => {
    if (MDX_SAFE_TAGS.has(tag)) return whole;
    warnings.push(`지원하지 않는 태그 <${tag}/>를 제거했습니다.`);
    return "";
  });
  return out;
}

// 토글 제목(`## 제목 {toggle="true" color="Color"}`)의 트레일링 속성은 MDX 표현식으로
// 오인되어 빌드가 깨지므로 제거 — 이 사이트는 토글 제목 기능을 쓰지 않는다.
function stripHeadingAttrs(md) {
  return md.replace(/^(#{1,6}\s+.*?)\s*\{[^}\n]*\}\s*$/gm, "$1");
}

export function postprocessMarkdown(md, warnings) {
  let out = md;
  out = stripNotionOnlyAttrs(out);
  out = transformCallouts(out);
  out = transformHighlightSpans(out);
  out = transformTableauLinks(out);
  out = stripHeadingAttrs(out);
  out = unwrapUnknownTags(out, warnings);
  return out;
}

/* ───────────────── 이미지 파이프라인 ───────────────── */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Windows에서 방금 쓴 파일을 Defender/인덱서가 잠깐 잠그는 경우가 있어 짧게 재시도한다.
async function unlinkWithRetry(filePath) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      unlinkSync(filePath);
      return;
    } catch (err) {
      if (err.code === "ENOENT") return;
      if (attempt === 2) throw err;
      await sleep(150);
    }
  }
}

async function cleanupImages(slug) {
  if (!existsSync(IMG_DIR)) return;
  const re = new RegExp(`^${escapeRegExp(slug)}-\\d{2}\\.webp$`);
  for (const f of readdirSync(IMG_DIR)) {
    if (re.test(f)) await unlinkWithRetry(path.join(IMG_DIR, f));
  }
}

export function extractImageJobs(md) {
  const jobs = [];
  // alt 텍스트 캡처는 lazy(non-greedy) — [MOCK] 같은 대괄호가 alt 안에 있어도 안전 (content.ts와 동일 이슈)
  const re = /!\[([\s\S]*?)\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = re.exec(md))) {
    jobs.push({ match: m[0], alt: m[1], url: m[2] });
  }
  return jobs;
}

async function downloadImageBuffer(url) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`이미지 다운로드 실패: ${lastErr.message}`);
}

async function convertAndSave(buf, outPath, warnings, url) {
  let meta;
  try {
    meta = await sharp(buf).metadata();
  } catch {
    warnings.push(`이미지 파일이 아니거나 손상되었습니다 — 건너뜀: ${url}`);
    return false;
  }
  if (!["jpeg", "png", "webp", "gif"].includes(meta.format)) {
    warnings.push(`지원하지 않는 이미지 형식(${meta.format ?? "unknown"}) — 건너뜀: ${url}`);
    return false;
  }
  if (meta.pages && meta.pages > 1) {
    warnings.push(`애니메이션 이미지는 지원하지 않아 건너뛰었습니다: ${url}`);
    return false;
  }
  await sharp(buf)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);
  return true;
}

// 본문의 이미지를 다운로드해 webp로 변환하고, 마크다운 안의 URL을 로컬 경로로 치환한다.
export async function processImages(md, slug, warnings) {
  const jobs = extractImageJobs(md);
  if (jobs.length === 0) return md;

  mkdirSync(IMG_DIR, { recursive: true });
  await cleanupImages(slug);

  let out = md;
  const localPathByUrl = new Map();
  let counter = 0;
  for (const job of jobs) {
    let localPath = localPathByUrl.get(job.url);
    if (!localPath) {
      counter += 1;
      const num = String(counter).padStart(2, "0");
      const outPath = path.join(IMG_DIR, `${slug}-${num}.webp`);
      const buf = await downloadImageBuffer(job.url);
      const ok = await convertAndSave(buf, outPath, warnings, job.url);
      if (!ok) continue;
      localPath = `/images/blog/${slug}-${num}.webp`;
      localPathByUrl.set(job.url, localPath);
    }
    out = out.replace(job.match, `![${job.alt}](${localPath})`);
  }
  return out;
}

/* ───────────────── Notion API ───────────────── */

async function resolveDataSourceId(notion) {
  let db;
  try {
    db = await notion.databases.retrieve({ database_id: DATABASE_ID });
  } catch (err) {
    if (err.status === 401) {
      throw new Error("NOTION_TOKEN이 유효하지 않습니다 — 새로 발급받아 .env.local을 확인하세요.");
    }
    if (err.status === 404) {
      throw new Error(
        "데이터베이스를 찾을 수 없습니다 — integration이 이 DB에 연결되어 있는지 확인하세요 (DB 우측 상단 ... → 연결).",
      );
    }
    throw new Error(`Notion 연결 실패: ${err.message}`);
  }
  if (!db.data_sources?.length) {
    throw new Error("이 데이터베이스에서 데이터 소스를 찾을 수 없습니다.");
  }
  if (db.data_sources.length > 1) {
    console.warn(`⚠ 데이터 소스가 ${db.data_sources.length}개입니다 — 첫 번째만 사용합니다.`);
  }
  return db.data_sources[0].id;
}

async function validateSchema(notion, dataSourceId) {
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const errors = [];
  for (const cfg of Object.values(PROPS)) {
    const found = ds.properties[cfg.name];
    if (!found) errors.push(`  - "${cfg.name}" (${cfg.type}) 속성이 없습니다`);
    else if (found.type !== cfg.type) {
      errors.push(`  - "${cfg.name}"는 ${cfg.type} 타입이어야 하는데 ${found.type} 타입입니다`);
    }
  }
  if (errors.length) {
    throw new Error(
      `DB 속성이 예상과 다릅니다:\n${errors.join("\n")}\n\n필요한 속성:\n` +
        `  제목(title) / 날짜(date) / 요약(rich_text) / 태그(multi_select) / ` +
        `작성자(select) / 슬러그(rich_text) / 발행(checkbox)`,
    );
  }
}

async function queryPublishedPages(notion, dataSourceId) {
  const pages = [];
  let cursor;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: PROPS.published.name, checkbox: { equals: true } },
      start_cursor: cursor ?? undefined,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function fetchBodyMarkdown(notion, pageId, warnings) {
  const res = await notion.pages.retrieveMarkdown({ page_id: pageId });
  if (res.truncated) {
    warnings.push("문서가 너무 길어 일부 내용이 잘렸을 수 있습니다.");
  }
  for (const blockId of res.unknown_block_ids ?? []) {
    try {
      const block = await notion.blocks.retrieve({ block_id: blockId });
      warnings.push(`지원하지 않는 블록을 건너뛰었습니다: ${block.type}`);
    } catch {
      warnings.push(`지원하지 않는 블록을 건너뛰었습니다 (id: ${blockId}).`);
    }
  }
  return res.markdown;
}

/* ───────────────── 메타 추출·검증 ───────────────── */

export function extractMeta(page) {
  const title = readProp(page, "title") || "(제목 없음)";
  const date = readProp(page, "date");
  const slug = readProp(page, "slug");
  const summary = readProp(page, "summary") || "";
  const tags = readProp(page, "tags") || [];
  const author = readProp(page, "author") || "";

  const errors = [];
  if (!date) errors.push("날짜가 비어 있습니다");
  if (!slug) errors.push("슬러그가 비어 있습니다");
  else if (!SLUG_RE.test(slug)) {
    errors.push(`슬러그 "${slug}"는 영문 소문자·숫자·하이픈만 가능합니다 (예: my-post-title)`);
  }
  if (slug && GITIGNORE_TRAP.test(slug)) {
    console.warn(
      `⚠ "${title}"의 슬러그 "${slug}"가 .gitignore 패턴(secret*/credentials*/*token*)에 걸려 이미지가 무시될 수 있습니다.`,
    );
  }

  if (errors.length) {
    return { title, errors };
  }

  return {
    notionId: page.id,
    notionLastEdited: page.last_edited_time,
    title,
    slug,
    filename: `${date}-${slug}.mdx`,
    meta: { title, date, summary, tags, author },
    errors: [],
  };
}

/* ───────────────── 기존 관리 파일 스캔 ───────────────── */

function scanExisting() {
  mkdirSync(BLOG_DIR, { recursive: true });
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const managed = new Map(); // notionId -> { filename, lastEdited }
  const protectedFilenames = new Set(); // notionId 없는 손글 파일
  for (const f of files) {
    const raw = readFileSync(path.join(BLOG_DIR, f), "utf8");
    const { data } = matter(raw);
    if (data.notionId) {
      managed.set(data.notionId, { filename: f, lastEdited: data.notionLastEdited });
    } else {
      protectedFilenames.add(f);
    }
  }
  return { managed, protectedFilenames };
}

/* ───────────────── 계획 수립 ───────────────── */

export function buildPlan(desired, existing, force) {
  const plan = { create: [], update: [], rename: [], delete: [], skip: [] };
  const errors = [];
  const desiredIds = new Set(desired.map((d) => d.notionId));

  for (const item of desired) {
    const found = existing.managed.get(item.notionId);
    if (!found) {
      if (existing.protectedFilenames.has(item.filename)) {
        errors.push(`"${item.title}" 건너뜀: 파일명이 기존 손글 게시물과 충돌합니다 (${item.filename})`);
        continue;
      }
      plan.create.push(item);
    } else if (!force && found.lastEdited === item.notionLastEdited) {
      plan.skip.push(item);
    } else if (found.filename !== item.filename) {
      if (existing.protectedFilenames.has(item.filename)) {
        errors.push(
          `"${item.title}" 건너뜀: 이름 변경 대상 파일명이 손글 게시물과 충돌합니다 (${item.filename})`,
        );
        continue;
      }
      plan.rename.push({ ...item, oldFilename: found.filename });
    } else {
      plan.update.push(item);
    }
  }

  for (const [notionId, found] of existing.managed) {
    if (!desiredIds.has(notionId)) plan.delete.push(found);
  }

  return { plan, errors };
}

function printPlan(plan) {
  const line = (label, items, toStr) =>
    items.length > 0 && console.log(`  ${label} (${items.length}): ${items.map(toStr).join(", ")}`);
  console.log("\n계획:");
  line("생성", plan.create, (i) => i.filename);
  line("수정", plan.update, (i) => i.filename);
  line("이름변경", plan.rename, (i) => `${i.oldFilename} → ${i.filename}`);
  line("삭제", plan.delete, (i) => i.filename);
  console.log(`  변경없음: ${plan.skip.length}개`);
  if (
    plan.create.length + plan.update.length + plan.rename.length + plan.delete.length ===
    0
  ) {
    console.log("  (실행할 변경 사항 없음)");
  }
}

/* ───────────────── 실행 ───────────────── */

async function buildMdxForItem(notion, item, warnings) {
  const rawMarkdown = await fetchBodyMarkdown(notion, item.notionId, warnings);
  const processed = postprocessMarkdown(rawMarkdown, warnings);
  const body = await processImages(processed, item.slug, warnings);
  return matter.stringify(body, {
    ...item.meta,
    notionId: item.notionId,
    notionLastEdited: item.notionLastEdited,
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });

  if (values.help) {
    printUsage();
    return;
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error(`NOTION_TOKEN이 설정되지 않았습니다.

설정 방법:
  1. https://www.notion.so/my-integrations 에서 integration 생성 (Internal)
  2. 블로그 DB 페이지 우측 상단 "..." 메뉴 → 연결(Connections) → 방금 만든 integration 추가
  3. 레포 루트에 .env.local 파일을 만들고 아래 한 줄을 추가:
       NOTION_TOKEN=ntn_...
     (이 파일은 .gitignore에 등록되어 있어 커밋되지 않습니다. 토큰을 다른 곳에 붙여넣지 마세요.)`);
    process.exitCode = 1;
    return;
  }

  const notion = new Client({ auth: token });

  let dataSourceId;
  try {
    dataSourceId = await resolveDataSourceId(notion);
    await validateSchema(notion, dataSourceId);
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const pages = await queryPublishedPages(notion, dataSourceId);
  console.log(`발행된 글 ${pages.length}개 발견.`);

  const desired = [];
  let hadError = false;
  for (const page of pages) {
    const result = extractMeta(page);
    if (result.errors.length) {
      console.error(`✗ "${result.title}" 건너뜀:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`);
      hadError = true;
      continue;
    }
    desired.push(result);
  }

  const seenSlugs = new Map();
  const dedupedDesired = [];
  for (const item of desired) {
    if (seenSlugs.has(item.slug)) {
      console.error(
        `✗ 슬러그 "${item.slug}" 중복: "${item.title}" / "${seenSlugs.get(item.slug)}" — 둘 다 건너뜀`,
      );
      hadError = true;
      continue;
    }
    seenSlugs.set(item.slug, item.title);
    dedupedDesired.push(item);
  }

  const existing = scanExisting();
  const { plan, errors: planErrors } = buildPlan(dedupedDesired, existing, values.force);
  for (const e of planErrors) {
    console.error(`✗ ${e}`);
    hadError = true;
  }

  printPlan(plan);

  if (values["dry-run"]) {
    console.log("\n(--dry-run이므로 실제 변경은 없었습니다)");
    if (hadError) process.exitCode = 1;
    return;
  }

  for (const item of [...plan.create, ...plan.update, ...plan.rename]) {
    const warnings = [];
    try {
      const mdx = await buildMdxForItem(notion, item, warnings);
      writeFileSync(path.join(BLOG_DIR, item.filename), mdx, "utf8");
      if (item.oldFilename && item.oldFilename !== item.filename) {
        await unlinkWithRetry(path.join(BLOG_DIR, item.oldFilename));
        await cleanupImages(slugFromFilename(item.oldFilename));
      }
      console.log(`✓ ${item.filename}`);
      for (const w of warnings) console.warn(`  ⚠ ${w}`);
    } catch (err) {
      console.error(`✗ "${item.title}" 동기화 실패: ${err.message}`);
      hadError = true;
    }
  }

  for (const item of plan.delete) {
    await unlinkWithRetry(path.join(BLOG_DIR, item.filename));
    await cleanupImages(slugFromFilename(item.filename));
    console.log(`✓ 삭제됨: ${item.filename}`);
  }

  if (hadError) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
