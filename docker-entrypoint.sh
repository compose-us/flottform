#!/bin/bash

pnpm install

echo "ORIGIN=$ORIGIN"

exec "$@"
