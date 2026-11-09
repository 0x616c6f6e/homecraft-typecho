#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
mkdir -p work/testenv
if [ ! -f work/testenv/admin-password ]; then
  umask 077
  openssl rand -hex 24 > work/testenv/admin-password
fi
compose_file="${HC_DEV_COMPOSE_FILE:-dev/compose.yaml}"
# Use sudo -n docker if this user does not belong to the docker group.
if docker info >/dev/null 2>&1; then
  docker compose -f "$compose_file" "$@"
else
  sudo -n docker compose -f "$compose_file" "$@"
fi
