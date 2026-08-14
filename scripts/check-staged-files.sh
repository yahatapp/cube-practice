#!/usr/bin/env bash

set -euo pipefail

readonly MAX_BYTES=512000
has_oversized_file=false

while IFS= read -r -d '' path; do
  size="$(git cat-file -s ":${path}")"
  if ((size > MAX_BYTES)); then
    printf 'Staged file exceeds 500 KiB: %s (%s bytes)\n' "${path}" "${size}" >&2
    has_oversized_file=true
  fi
done < <(git diff --cached --name-only --diff-filter=ACMR -z)

if [[ "${has_oversized_file}" == "true" ]]; then
  exit 1
fi
