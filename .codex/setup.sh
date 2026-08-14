#!/usr/bin/env bash

set -euo pipefail

readonly NIX_INSTALLER_VERSION="v3.21.0"
readonly NIX_INSTALLER_SHA256="c3cf066a28941e89fa1e38ed36f2acfc7479f9b088ddcf35160362a5ee89bd43"
readonly NIX_INSTALLER_URL="https://install.determinate.systems/nix/tag/${NIX_INSTALLER_VERSION}/nix-installer.sh"
REPO_ROOT="$(git rev-parse --show-toplevel)"
readonly REPO_ROOT
readonly NIX_ENV_FILE="${HOME}/.cache/cube-practice-nix-env.sh"
cd "${REPO_ROOT}"

# Nix may already be installed while missing from PATH in a fresh Codex shell.
if ! command -v nix >/dev/null 2>&1 && [[ -r /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]]; then
  # shellcheck disable=SC1091
  source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi

if ! command -v nix >/dev/null 2>&1; then
  if [[ "$(uname -s)" != "Linux" || "$(id -u)" -ne 0 ]]; then
    echo "Automatic Nix installation is supported only in the root Linux environment used by Codex Cloud." >&2
    echo "Install Nix for this host, then run this setup script again." >&2
    exit 1
  fi

  NIX_INSTALLER="$(mktemp)"
  readonly NIX_INSTALLER
  trap 'rm -f "${NIX_INSTALLER}"' EXIT

  echo "Nix was not found; installing it with installer ${NIX_INSTALLER_VERSION} for Codex Cloud."
  curl --proto '=https' --tlsv1.2 -fsSL "${NIX_INSTALLER_URL}" -o "${NIX_INSTALLER}"
  printf '%s  %s\n' "${NIX_INSTALLER_SHA256}" "${NIX_INSTALLER}" | sha256sum -c -
  bash "${NIX_INSTALLER}" install linux \
    --no-confirm \
    --prefer-upstream-nix \
    --diagnostic-endpoint "" \
    --init none \
    --extra-conf "experimental-features = nix-command flakes" \
    --extra-conf "sandbox = false"

  # shellcheck disable=SC1091
  source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi

# Use the same locked toolchain as local development and GitHub Actions.
nix develop --no-update-lock-file --command pnpm install --frozen-lockfile
nix develop --no-update-lock-file --command pnpm run hooks:install
nix develop --no-update-lock-file --command pnpm run guard:betterleaks-canary

# Setup and later Codex commands run in separate shells, so persist the evaluated
# development environment for subsequent commands.
mkdir -p "$(dirname "${NIX_ENV_FILE}")"
nix print-dev-env > "${NIX_ENV_FILE}"
chmod 0600 "${NIX_ENV_FILE}"

touch "${HOME}/.bashrc"
readonly SOURCE_LINE="source \"${NIX_ENV_FILE}\""
grep -qxF "${SOURCE_LINE}" "${HOME}/.bashrc" || printf '%s\n' "${SOURCE_LINE}" >> "${HOME}/.bashrc"

echo "Codex Cloud setup complete."
nix develop --no-update-lock-file --command node --version
nix develop --no-update-lock-file --command pnpm --version
nix develop --no-update-lock-file --command betterleaks --version
nix develop --no-update-lock-file --command vp --version
