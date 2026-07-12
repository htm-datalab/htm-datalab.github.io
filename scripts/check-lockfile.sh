#!/bin/sh
# package.json/package-lock.json이 어긋난 채 커밋되는 것을 막는다 (CLAUDE.md 6장).
# npm ci가 CI에서만 터지는 걸 미리 로컬에서 잡는다 — 두 파일이 스테이징된 경우에만 실행.
# 사용: 수동 실행(sh scripts/check-lockfile.sh) 또는 pre-commit 훅으로 자동 실행.

staged=$(git diff --cached --name-only)
echo "$staged" | grep -qE '^(package\.json|package-lock\.json)$' || exit 0

echo "package.json/package-lock.json 변경 감지 — npm ci --dry-run으로 정합성 확인 중..."

if ! npm ci --dry-run --no-audit --no-fund --ignore-scripts > /tmp/check-lockfile.out 2>&1; then
  echo "✘ package-lock.json이 package.json과 어긋나 있습니다 (npm ci가 CI에서 실패합니다):"
  echo ""
  cat /tmp/check-lockfile.out
  echo ""
  echo "커밋이 차단되었습니다. \`npm run lock:regen\`으로 lockfile을 다시 만든 뒤 커밋하세요. (CLAUDE.md 6장)"
  rm -f /tmp/check-lockfile.out
  exit 1
fi

rm -f /tmp/check-lockfile.out
echo "✔ lockfile 정합성 확인 통과"
exit 0
