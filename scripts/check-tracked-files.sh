#!/usr/bin/env bash

set -euo pipefail

has_forbidden_file=false

while IFS= read -r -d '' path; do
  basename="${path##*/}"

  case "${basename}" in
    .env.example | .dev.vars.example)
      ;;
    .env | .env.* | .dev.vars | .dev.vars.*)
      printf 'Local environment file must not be tracked: %s\n' "${path}" >&2
      has_forbidden_file=true
      ;;
  esac
done < <(git ls-files -z)

if [[ "${has_forbidden_file}" == "true" ]]; then
  exit 1
fi
