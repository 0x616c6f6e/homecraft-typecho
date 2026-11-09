#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
python3 tests/package.py
export HC_DEV_COMPOSE_FILE=dev/release.compose.yaml
./dev/run.sh down -v
reload_pid=''
cleanup() {
  if [ -n "$reload_pid" ]; then kill "$reload_pid" 2>/dev/null || true; wait "$reload_pid" 2>/dev/null || true; fi
  ./dev/run.sh down -v
}
trap cleanup EXIT
./dev/run.sh up -d
ready=0
for attempt in $(seq 1 60); do
  if curl -fs http://127.0.0.1:18096/admin/login.php >/dev/null && curl -fs http://127.0.0.1:18097/journal/admin/login.php >/dev/null; then ready=1; break; fi
  sleep 1
done
[ "$ready" = 1 ]
./dev/run.sh exec -T subdirectory php /dev-tools/permalink-mode.php 1
rm -f work/release-test/reload-request work/release-test/reload-complete
# Reload only these test workers after an atomic release switch, clearing PHP realpath/OPcache.
(
  while :; do
    if [ -f work/release-test/reload-request ]; then
      request=$(cat work/release-test/reload-request)
      complete=$(cat work/release-test/reload-complete 2>/dev/null || true)
      if [ "$request" != "$complete" ]; then
        ./dev/run.sh exec -T root apachectl -k graceful >>work/release-test/reload.log 2>&1
        ./dev/run.sh exec -T subdirectory apachectl -k graceful >>work/release-test/reload.log 2>&1
        printf '%s' "$request" >work/release-test/reload-complete
      fi
    fi
    sleep 1
  done
) &
reload_pid=$!
HC_TEST_AUTH=1 HC_TEST_RELEASE=1 ./dev/browser.sh tests/phase6.cjs
