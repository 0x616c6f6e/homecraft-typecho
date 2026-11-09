#!/usr/bin/env bash
# Usage: ./dev/browser.sh work/testenv/scene.cjs [script arguments...]
set -eu
cd "$(dirname "$0")/.."
script="$(realpath "${1:?Pass a local CommonJS Playwright script}")"
shift
mkdir -p work/testenv/browser-results
image='mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a'
if docker info >/dev/null 2>&1; then
  docker_command=(docker)
else
  docker_command=(sudo -n docker)
fi
release_mount=()
if [ "${HC_TEST_RELEASE:-0}" = 1 ]; then
  release_mount=(-v "$PWD/work/release-test:/release-workspace")
fi
auth_mount=()
if [ "${HC_TEST_AUTH:-0}" = 1 ]; then
  test -f work/testenv/admin-password
  auth_mount=(-v "$PWD/work/testenv/admin-password:/run/secrets/theme-dev-password:ro")
fi
"${docker_command[@]}" run --rm --network host --ipc private --shm-size 1g \
  "${auth_mount[@]}" "${release_mount[@]}" \
  -v "$script:/browser-test.cjs:ro" \
  -v "$PWD/work/testenv/browser-results:/results" \
  -w /results "$image" bash -c \
  'npm install --prefix /tmp/browser --no-audit --no-fund playwright@1.56.1 >/tmp/npm-install.log 2>&1 && NODE_PATH=/tmp/browser/node_modules node /browser-test.cjs "$@"' bash "$@"
