#!/usr/bin/env bash
set -eu
# Used only by the two disposable Phase 6 services.
mkdir -p /app/usr/themes
# init_typecho skips copying a pre-existing themes directory; keep its stock theme available.
if [ ! -d /app/usr/themes/default ]; then
  cp -a /usr/src/typecho/usr/themes/default /app/usr/themes/default
fi
ln -sfn /release-workspace/active /app/usr/themes/homecraft-typecho
a2enmod headers >/dev/null
exec /bin/bash /dev-tools/start.sh
