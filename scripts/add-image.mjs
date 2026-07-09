// 팀/갤러리 사진을 webp로 변환하는 로컬 CLI. JSON 파일은 건드리지 않고
// content/data/{members,gallery}.json에 붙여넣을 스니펫만 출력한다.
//
// 사용법:
//   npm run add-image -- <파일1> [파일2 ...] --to <team|gallery> [--name <이름>] [--quality <1-100>] [--force]
//
// 예:
//   npm run add-image -- "C:\Users\me\Pictures\팀 사진.jpg" --to gallery --name kickoff-day
import { parseArgs } from "node:util";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const TARGET_DIRS = {
  team: path.join(REPO_ROOT, "public", "images", "team"),
  gallery: path.join(REPO_ROOT, "public", "images", "gallery"),
};
const SUPPORTED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_DIMENSION = 1600;
const MAX_RECOMMENDED_BYTES = 300 * 1024;
const GITIGNORE_TRAP = /^(secret|credentials)|token/i;

function printUsage() {
  console.log(`사용법:
  npm run add-image -- <파일1> [파일2 ...] --to <team|gallery> [--name <이름>] [--quality <1-100>] [--force]

옵션:
  --to team|gallery   저장 위치 (필수)
  --name <이름>        출력 파일명 (확장자 제외, 입력 파일 1개일 때만 사용 가능)
  --quality <1-100>   webp 품질 (기본 80)
  --force             같은 이름의 파일이 있어도 덮어쓰기

예:
  npm run add-image -- "C:\\Users\\me\\Pictures\\팀 사진.jpg" --to gallery --name kickoff-day
  npm run add-image -- ".\\hyebin.jpg" --to team --name hyebin

지원 형식: png, jpg, jpeg, webp (변환됨) / gif는 지원하지 않음 / svg는 변환 없이 직접 복사`);
}

function slugify(base) {
  return base
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function todayLocalISODate() {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function printSnippet(to, name) {
  const webPath = `/images/${to}/${name}.webp`;
  if (to === "gallery") {
    console.log(`\ncontent/data/gallery.json 배열에 추가:`);
    console.log(
      JSON.stringify(
        {
          src: webPath,
          alt: "[MOCK] TODO: 스크린리더용 사진 설명",
          caption: "[MOCK] TODO: 사진 캡션",
          tags: [],
          date: todayLocalISODate(),
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`\ncontent/data/members.json의 해당 팀원 항목에서 두 필드 교체:`);
    console.log(`  "photo": "${webPath}",`);
    console.log(`  "alt": "TODO: OO 프로필 사진 설명"`);
  }
}

async function processFile(inputPath, { to, name, quality, force }) {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === ".gif") {
    throw new Error(`GIF는 지원하지 않습니다 — PNG/JPG/WEBP만 가능: ${inputPath}`);
  }
  if (ext === ".svg") {
    throw new Error(
      `SVG는 변환이 필요 없습니다 — public/images/${to}/에 직접 복사하세요: ${inputPath}`,
    );
  }
  if (!SUPPORTED_EXT.has(ext)) {
    throw new Error(`지원하지 않는 확장자입니다 (${ext}): ${inputPath}`);
  }
  if (!existsSync(inputPath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${path.resolve(inputPath)}`);
  }

  let meta;
  try {
    meta = await sharp(inputPath).metadata();
  } catch {
    throw new Error(`이미지 파일이 아니거나 손상되었습니다: ${inputPath}`);
  }
  if (!["jpeg", "png", "webp"].includes(meta.format)) {
    throw new Error(`이미지 형식을 확인할 수 없습니다 (${meta.format ?? "unknown"}): ${inputPath}`);
  }
  if (meta.pages && meta.pages > 1) {
    throw new Error(`애니메이션 이미지는 지원하지 않습니다: ${inputPath}`);
  }

  const outName = name ?? slugify(path.basename(inputPath, ext));
  if (!outName) {
    throw new Error(
      `파일명에서 사용할 수 있는 이름을 만들 수 없습니다 — --name으로 이름을 지정하세요: ${inputPath}`,
    );
  }
  if (GITIGNORE_TRAP.test(outName)) {
    console.warn(
      `⚠ "${outName}"은 .gitignore 패턴(secret*/credentials*/*token*)에 걸려 git이 무시할 수 있습니다.`,
    );
  }

  const outDir = TARGET_DIRS[to];
  const outPath = path.join(outDir, `${outName}.webp`);
  if (existsSync(outPath) && !force) {
    throw new Error(
      `이미 존재하는 파일입니다: ${outPath}\n  --name으로 다른 이름을 쓰거나 --force로 덮어쓰세요.`,
    );
  }

  const before = statSync(inputPath).size;
  const dims = await sharp(inputPath)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
  const after = statSync(outPath).size;

  console.log(`\n✓ ${inputPath}`);
  console.log(
    `  → ${path.relative(REPO_ROOT, outPath)} (${dims.width}x${dims.height}, ${formatBytes(before)} → ${formatBytes(after)})`,
  );
  if (after > MAX_RECOMMENDED_BYTES) {
    console.warn(`  ⚠ 용량이 300KB를 초과합니다 — --quality를 낮춰보세요 (현재 ${quality}).`);
  }

  printSnippet(to, outName);
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      to: { type: "string" },
      name: { type: "string" },
      quality: { type: "string", default: "80" },
      force: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    printUsage();
    process.exitCode = values.help ? 0 : 1;
    return;
  }

  if (values.to !== "team" && values.to !== "gallery") {
    console.error(`--to는 team 또는 gallery여야 합니다 (입력값: ${values.to ?? "없음"})\n`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (values.name && positionals.length > 1) {
    console.error("--name은 입력 파일이 1개일 때만 사용할 수 있습니다.");
    process.exitCode = 1;
    return;
  }

  const quality = Number.parseInt(values.quality, 10);
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
    console.error(`--quality는 1~100 사이의 정수여야 합니다 (입력값: ${values.quality})`);
    process.exitCode = 1;
    return;
  }

  let hadError = false;
  for (const inputPath of positionals) {
    try {
      await processFile(inputPath, { to: values.to, name: values.name, quality, force: values.force });
    } catch (err) {
      hadError = true;
      console.error(`\n✗ ${err.message}`);
    }
  }

  if (hadError) process.exitCode = 1;
}

main();
