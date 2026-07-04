#!/bin/sh
# 커밋 전 시크릿/실데이터 스캔 (CLAUDE.md 2장)
# 사용: 수동 실행(sh scripts/check-secrets.sh) 또는 pre-commit 훅으로 자동 실행.
# 하나라도 걸리면 exit 1 → 커밋 중단.

fail=0

# 1) 스테이징된 파일 중 데이터/자격증명 확장자
banned_files=$(git diff --cached --name-only | grep -iE '\.(csv|tsv|xlsx|xls|parquet|ipynb|pem|key)$')
if [ -n "$banned_files" ]; then
  echo "✘ 데이터/키 파일이 스테이징되어 있습니다 (커밋 금지):"
  echo "$banned_files"
  fail=1
fi

# 2) 스테이징된 diff에서 시크릿 패턴
secret_hits=$(git diff --cached -U0 | grep -inE '(api[_-]?key|client[_-]?secret|access[_-]?token|password|passwd|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY)' | grep -v 'check-secrets\|CLAUDE.md')
if [ -n "$secret_hits" ]; then
  echo "✘ 시크릿으로 의심되는 패턴이 diff에 있습니다:"
  echo "$secret_hits"
  fail=1
fi

# 3) 개인정보 패턴 (한국 휴대전화번호)
phone_hits=$(git diff --cached -U0 | grep -nE '01[016789][-. ]?[0-9]{3,4}[-. ]?[0-9]{4}' | grep -v 'check-secrets')
if [ -n "$phone_hits" ]; then
  echo "✘ 전화번호로 의심되는 패턴이 diff에 있습니다:"
  echo "$phone_hits"
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "커밋이 차단되었습니다. 위 항목을 제거하거나, 오탐이면 팀장 확인 후 진행하세요. (CLAUDE.md 2장)"
  exit 1
fi

echo "✔ 시크릿/실데이터 스캔 통과"
exit 0
