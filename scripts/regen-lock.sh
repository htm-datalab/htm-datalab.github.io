#!/bin/sh
# package-lock.json을 CI와 동일한 Linux(node:24)에서 fresh full install로 재생성한다.
# Windows/macOS에서 만든 lockfile은 sharp·lightningcss·oxide·SWC 등 플랫폼별
# 네이티브 바이너리(optional deps)가 누락·오링크되어 CI의 npm ci/build가 깨진다 (CLAUDE.md 6장).
# --package-lock-only는 네이티브 설치 링크를 온전히 담지 못해 부족하므로 쓰지 않는다.
#
# 사용: sh scripts/regen-lock.sh  (Docker 필요)

set -e
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! command -v docker > /dev/null 2>&1; then
  echo "✘ Docker가 필요합니다. Docker Desktop 설치 후 다시 실행하세요."
  echo "  Docker 없이 급하게 처리해야 하면: GitHub에서 이 브랜치로 PR을 열어"
  echo "  ci-check 워크플로우가 통과하는지로 대신 검증하세요."
  exit 1
fi

OUT_DIR="$ROOT/.regen-lock-tmp"
mkdir -p "$OUT_DIR"
git archive HEAD -o "$OUT_DIR/repo.tar"

echo "node:24 컨테이너에서 재생성 중..."
# 출력을 stdout으로 캡처하지 않고 바인드마운트로 직접 써야 npm 로그가 lockfile에 섞이지 않는다.
docker run --rm \
  -v "$OUT_DIR:/out" \
  node:24 bash -lc "
    set -e
    mkdir -p /work && cd /work
    tar xf /out/repo.tar
    npm install --no-audit --no-fund
    cp package-lock.json /out/package-lock.json.new
  "

if ! node -e "JSON.parse(require('fs').readFileSync('$OUT_DIR/package-lock.json.new','utf8'))" 2>/dev/null; then
  echo "✘ 재생성된 lockfile이 올바른 JSON이 아닙니다."
  rm -rf "$OUT_DIR"
  exit 1
fi

mv "$OUT_DIR/package-lock.json.new" "$ROOT/package-lock.json"
rm -rf "$OUT_DIR"

echo "호스트에서 정합성 확인 중..."
npm ci --dry-run --no-audit --no-fund

echo "✔ package-lock.json 재생성 완료. git diff로 확인 후 커밋하세요."
