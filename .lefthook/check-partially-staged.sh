#!/bin/sh

partial_files=$(
  git diff --cached --name-only --diff-filter=ACMR |
    while IFS= read -r file; do
      if ! git diff --quiet -- "$file"; then
        printf '%s\n' "$file"
      fi
    done
)

if [ -n "$partial_files" ]; then
  echo ""
  echo "部分的にstageされているファイルがあります。"
  echo "pre-commitの自動修正は実行しません。"
  echo ""
  printf '%s\n' "$partial_files"
  echo ""
  echo "ファイル全体をstageするか、変更を整理してから再度commitしてください。"
  exit 1
fi