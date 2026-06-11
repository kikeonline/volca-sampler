#!/usr/bin/env bash

set -euo pipefail

if ! command -v emcc >/dev/null 2>&1; then
  echo "Error: emcc is required to build the Syro WebAssembly bindings." >&2
  echo "Install and activate Emscripten before running npm install:" >&2
  echo "https://emscripten.org/docs/getting_started/downloads.html" >&2
  exit 1
fi

syro_source="./syro/volcasample/syro/korg_syro_volcasample.c"
if [[ ! -f "$syro_source" ]]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Initializing the Korg Syro submodule..."
    git submodule update --init --recursive syro/volcasample
  fi
fi

if [[ ! -f "$syro_source" ]]; then
  echo "Error: Korg Syro source files are missing." >&2
  echo "Run: git submodule update --init --recursive" >&2
  exit 1
fi

# For debugging memory issues, we can
# replace -O3 with:
# -g \
# -s STACK_OVERFLOW_CHECK=1 \
# -s DEMANGLE_SUPPORT=1 -s \
# INITIAL_MEMORY=655360000 \
# -fsanitize=address \

emcc \
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS='["cwrap", "addFunction", "removeFunction", "HEAP8"]' \
  -s MODULARIZE=1 -s 'EXPORT_NAME="CREATE_SYRO_BINDINGS"' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s ALLOW_TABLE_GROWTH=1 \
  -O2 \
  ./syro/volcasample/syro/korg_syro_volcasample.c \
  ./syro/volcasample/syro/korg_syro_func.c \
  ./syro/volcasample/syro/korg_syro_comp.c \
  ./syro/syro-bindings.c \
  -o public/syro-bindings.js

emcc \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s BUILD_AS_WORKER=1 \
  -O2 \
  ./syro/volcasample/syro/korg_syro_volcasample.c \
  ./syro/volcasample/syro/korg_syro_func.c \
  ./syro/volcasample/syro/korg_syro_comp.c \
  ./syro/syro-worker.c \
  -o public/syro-worker.js
