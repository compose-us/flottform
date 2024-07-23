#!/bin/bash

pnpm install
# pnpm -r run build

echo "ORIGIN=$ORIGIN"

exec "$@"
