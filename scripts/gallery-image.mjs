// 갤러리 사진 전용 간편 변환기.
// 기존 add-image.mjs를 재사용해 EXIF 제거, 1600px 리사이즈,
// WebP 변환 후 public/images/gallery/에 저장한다.
//
// 사용법:
//   npm run gallery-image -- "C:\사진\원본.jpg" --name 원하는-파일명
//
// 결과:
//   public/images/gallery/원하는-파일명.webp
//   gallery.json에 붙여 넣을 JSON 스니펫

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const wantsHelp = args.includes("--help") || args.includes("-h");

function printUsage() {
  console.log(`갤러리 사진 WebP 변환

사용법:
  npm run gallery-image -- "이미지 전체 경로" --name 원하는-파일명

예:
  npm run gallery-image -- "C:\\Users\\me\\Pictures\\회의 사진.jpg" --name team-meeting-20260726

자동 처리:
  - EXIF 및 위치정보 제거
  - 긴 변 기준 1600px 리사이즈
  - WebP 변환
  - public/images/gallery/에 저장
  - gallery.json용 JSON 출력

선택 옵션:
  --quality 1~100   WebP 품질 (기본 60)
  --force           같은 이름의 기존 파일 덮어쓰기`);
}

if (wantsHelp || args.length === 0) {
  printUsage();
  process.exit(wantsHelp ? 0 : 1);
}

if (args.includes("--to")) {
  console.error("✗ gallery-image 명령에는 --to 옵션을 입력하지 마세요.");
  process.exit(1);
}

const converterPath = fileURLToPath(new URL("./add-image.mjs", import.meta.url));
const converterArgs = [...args, "--to", "gallery"];

if (!args.includes("--quality")) {
  converterArgs.push("--quality", "60");
}

const result = spawnSync(process.execPath, [converterPath, ...converterArgs], {
  stdio: "inherit",
});

if (result.error) {
  console.error(`✗ 변환기를 실행하지 못했습니다: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
