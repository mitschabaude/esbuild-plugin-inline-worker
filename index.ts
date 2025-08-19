import {type BuildOptions, type PluginBuild, build } from "esbuild";
import findCacheDir from "find-cache-dir";
import fs from "fs";
import path from "path";

export type InlineWorkerPluginConfig = {
    buildOptions?: BuildOptions;
    workerName?: string
    workerArguments?: WorkerOptions
}

export function inlineWorkerPlugin(
    workerPluginConfig: InlineWorkerPluginConfig = {},
) {
    return {
        name: "esbuild-plugin-inline-worker",

        setup(build: PluginBuild) {
            build.onLoad(
                { filter: /\.worker.(js|jsx|ts|tsx)$/ },
                async ({ path: workerPath }) => {
                    // const workerCode = await fs.promises.readFile(workerPath, {
                    //   encoding: 'utf-8',
                    // });

                    const workerCode = await buildWorker(workerPath, workerPluginConfig);
                    return {
                        contents: `import inlineWorker from '__inline-worker'
export default function Worker() {
  return inlineWorker(${JSON.stringify(workerCode)});
}
`,
                        loader: "js",
                    };
                },
            );

            const options: WorkerOptions = {
                name: workerPluginConfig.workerName || undefined,
                ...workerPluginConfig.workerArguments,
            }

            const inlineWorkerFunctionCode = `
export default function inlineWorker(scriptText) {
  const blob = new Blob([scriptText], {type: 'text/javascript'});
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url, ${JSON.stringify(options)});
  URL.revokeObjectURL(url);
  return worker;
}
`;

            build.onResolve({ filter: /^__inline-worker$/ }, ({ path }) => {
                return { path, namespace: "inline-worker" };
            });
            build.onLoad({ filter: /.*/, namespace: "inline-worker" }, () => {
                return { contents: inlineWorkerFunctionCode, loader: "js" };
            });
        },
    };
}

const cacheDir = findCacheDir({
    name: "esbuild-plugin-inline-worker",
    create: true,
});

async function buildWorker(workerPath: string, pluginConfig: InlineWorkerPluginConfig) {
    const scriptNameParts = path.basename(workerPath).split(".");
    scriptNameParts.pop();
    scriptNameParts.push("js");
    const scriptName = scriptNameParts.join(".");
    if (!cacheDir) {
        throw new Error("Cache directory not found. Please ensure 'find-cache-dir' is installed.");
    }
    const bundlePath = path.resolve(cacheDir, scriptName);

    if (pluginConfig.buildOptions) {
        delete pluginConfig.buildOptions.entryPoints;
        delete pluginConfig.buildOptions.outfile;
        delete pluginConfig.buildOptions.outdir;
    }

    await build({
        entryPoints: [workerPath],
        bundle: true,
        minify: true,
        outfile: bundlePath,
        target: "es2017",
        format: "esm",
        ...pluginConfig.buildOptions,
    });

    return fs.promises.readFile(bundlePath, { encoding: "utf-8" });
}
