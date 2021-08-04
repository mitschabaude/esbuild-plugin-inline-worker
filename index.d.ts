import {BuildOptions} from 'esbuild';

export default function inlineWorkerPlugin(buildConfig?: BuildOptions): {
  name: 'esbuild-plugin-inline-worker';
  setup: (build: unknown) => void;
};
