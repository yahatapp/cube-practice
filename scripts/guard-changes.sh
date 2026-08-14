#!/usr/bin/env bash

set -euo pipefail

pnpm run guard:betterleaks-canary
pnpm run guard:tracked-files
pnpm run check
pnpm test
