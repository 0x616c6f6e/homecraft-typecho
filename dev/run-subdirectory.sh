#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
export HC_DEV_COMPOSE_FILE=dev/subdirectory.compose.yaml
exec ./dev/run.sh "$@"
