#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
mkdir -p dist
if docker info >/dev/null 2>&1; then docker_command=(docker); else docker_command=(sudo -n docker); fi
"${docker_command[@]}" run --rm --user "$(id -u):$(id -g)" -v "$PWD:/repo:ro" -v "$PWD/dist:/output" \
  -w /repo mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a \
  node /repo/tools/package.mjs --output /output "$@"
