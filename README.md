# esbuild-plugin-inline-worker

This is a plugin for [esbuild](https://esbuild.github.io) which allows you to import `.worker.js` files to get the constructor for a Web Worker, similar to [worker-loader](https://github.com/webpack-contrib/worker-loader) for Webpack.

```sh
yarn add esbuild-plugin-inline-worker
```

Example:

```js
// example.worker.js
postMessage('hello from worker!');
```

```js
// example.js
import Worker from './example.worker.js';
let worker = Worker();
worker.onmessage = ({data}) => console.log(data);
```

In this example, `worker` will be an instance of [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).

Conveniently, you don't have to take care of having the worker's JavaScript file in the right location on your server. Instead, the JS code for the worker is inlined to the bundle produced by esbuild. This makes this plugin perfect for JS library authors who want to use workers for performance optimization, where the need for a separate worker file is awkward.

The inlined worker code will be created with a separate call to esbuild. That means your worker code can import libraries and use TypeScript or JSX!
Supported file extensions for the worker are `.worker.js`, `.worker.ts`, `.worker.jsx`, `.worker.tsx`.

## Usage

```js
import {build} from 'esbuild';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';

build({
  /* ... */
  plugins: [inlineWorkerPlugin()],
});
```

## Build configuration

Optionally, you can pass a configuration object which has the same interface as esbuild's [build API](https://esbuild.github.io/api/#build-api), which determines how the worker code is bundled:

```js
inlineWorkerPlugin(extraConfig);
```

This is how your custom config is used internally:

```js
if (extraConfig) {
  delete extraConfig.entryPoints;
  delete extraConfig.outfile;
  delete extraConfig.outdir;
}

await esbuild.build({
  entryPoints: [workerPath],
  bundle: true,
  minify: true,
  outfile: bundlePath,
  target: 'es2017',
  format: 'esm',
  ...extraConfig, // <-- your config can override almost everything
});
```
