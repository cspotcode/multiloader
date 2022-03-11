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
npm install


# Run the example:

node --loader @cspotcode/multiloader/yaml-loader,ts-node/esm ./example.ts
node --loader @cspotcode/multiloader/compose?yaml-loader,ts-node/esm ./example.ts
# node --loader multiloader?yaml-loader,ts-node/esm ./example.ts
