#!/usr/bin/env bash
set -euo pipefail
set -x

__dirname="$(CDPATH= cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$__dirname"

# Package the local multiloader, then install it into this example
pushd ../
rm *.tgz || true
npm pack
popd
npm install ../*.tgz


# Run the example:

node --loader multiloader/yaml-loader,ts-node/esm ./example.ts
node --loader multiloader/compose?yaml-loader,ts-node/esm ./example.ts
# node --loader multiloader?yaml-loader,ts-node/esm ./example.ts