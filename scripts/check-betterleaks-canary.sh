#!/usr/bin/env bash

set -euo pipefail

readonly TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

readonly CANARY_FILE="${TEMP_DIR}/canary.txt"
readonly REPORT_FILE="${TEMP_DIR}/report.json"
readonly CANARY_PREFIX='github_token = "ghp_'
readonly CANARY_VALUE='aB3dE7gH9jK2mN4pQ6sT8vW1yZ5cD0fGhJ2k'
printf '%s%s"\n' "${CANARY_PREFIX}" "${CANARY_VALUE}" > "${CANARY_FILE}"

set +e
betterleaks dir \
  --no-banner \
  --redact \
  --report-format json \
  --report-path "${REPORT_FILE}" \
  "${CANARY_FILE}" >/dev/null 2>&1
readonly STATUS=$?
set -e

if [[ "${STATUS}" -ne 1 ]] || ! grep -q '"RuleID"' "${REPORT_FILE}"; then
  echo "Betterleaks canary failed: the known synthetic token was not detected." >&2
  echo "Betterleaks exit status: ${STATUS}" >&2
  exit 1
fi

echo "Betterleaks canary passed."
