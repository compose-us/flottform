#!/bin/bash

pnpm install
pnpm -r build

echo "ORIGIN=$ORIGIN"

exec "$@"
