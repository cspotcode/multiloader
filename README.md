# Composable `node --loader`

For working usage example, see `./example/run.sh`

## Compose multiple loaders from the command-line

```shell
# Example of ts-node and yaml-loader combined
npm install @cspotcode/multiloader yaml-loader ts-node
node --loader @cspotcode/multiloader/compose?yaml-loader,ts-node/esm ./example.ts
```

## Install loaders at runtime

```shell
node --loader @cspotcode/multiloader ./main.js
```

```javascript
await process.loaders.add(import('ts-node/esm'));
// or
await process.loaders.add('ts-node/esm', import.meta.url);
// or in CommonJS
await process.loaders.add('ts-node/esm', module);

// Subsequent imports can rely on the previously-installed loaders
await import('./cli.config.ts');
```
