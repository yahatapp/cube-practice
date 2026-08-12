#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
readonly NIX_FEATURES="nix-command flakes"

load_nix_profile() {
  local profile

  for profile in \
    "${HOME}/.nix-profile/etc/profile.d/nix.sh" \
    "/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh" \
    "/nix/var/nix/profiles/default/etc/profile.d/nix.sh"
  do
    if [[ -r "${profile}" ]]; then
      # shellcheck disable=SC1090
      source "${profile}"
      return 0
    fi
  done

  return 1
}

install_nix() {
  echo "Nix is not installed; installing it now."

  if [[ "$(id -u)" -eq 0 ]]; then
    curl --proto '=https' --tlsv1.2 --fail --silent --show-error --location \
      https://nixos.org/nix/install \
      | sh -s -- --daemon --yes
  else
    curl --proto '=https' --tlsv1.2 --fail --silent --show-error --location \
      https://nixos.org/nix/install \
      | sh -s -- --no-daemon --yes
  fi

  load_nix_profile
}

persist_nix_profile() {
  local bashrc="${HOME}/.bashrc"
  local marker="# cube-practice: load Nix"

  if [[ -f "${bashrc}" ]] && grep -Fq "${marker}" "${bashrc}"; then
    return 0
  fi

  {
    printf '\n%s\n' "${marker}"
    cat <<'EOF'
if [ -r "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
  . "$HOME/.nix-profile/etc/profile.d/nix.sh"
elif [ -r /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]; then
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
elif [ -r /nix/var/nix/profiles/default/etc/profile.d/nix.sh ]; then
  . /nix/var/nix/profiles/default/etc/profile.d/nix.sh
fi
EOF
  } >> "${bashrc}"
}

cd "${REPO_ROOT}"

if ! command -v nix >/dev/null 2>&1; then
  load_nix_profile || install_nix
fi

if ! command -v nix >/dev/null 2>&1; then
  echo "Nix installation completed, but the nix command is unavailable." >&2
  exit 1
fi

persist_nix_profile

if [[ ! -f flake.nix || ! -f flake.lock ]]; then
  echo "flake.nix and flake.lock are required at ${REPO_ROOT}." >&2
  exit 1
fi

echo "Validating the locked Nix development environment."
nix --extra-experimental-features "${NIX_FEATURES}" \
  flake check --no-update-lock-file --no-build

echo "Installing project dependencies inside the Nix development environment."
nix --extra-experimental-features "${NIX_FEATURES}" \
  develop --no-update-lock-file --command bash -euo pipefail -c '
    printf "Node.js: %s\n" "$(node --version)"
    printf "pnpm: %s\n" "$(pnpm --version)"

    if [[ -f pnpm-lock.yaml ]]; then
      pnpm install --frozen-lockfile
    else
      pnpm install --no-frozen-lockfile
    fi
  '

echo "Codex Cloud setup completed successfully."
