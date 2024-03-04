#!/bin/bash

pnpm install
pnpm -r build

exec "$@"
