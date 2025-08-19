declare module 'find-cache-dir' {
  interface Options {
    /** Name of the cache directory. */
    name: string;
    /** Create the cache directory if it doesn't exist. */
    create?: boolean;
    /** Current working directory to start searching from. */
    cwd?: string;
    /** Cache directory to look for. */
    files?: string[];
    /** Stop looking for cache directory after this directory. */
    thunk?: boolean;
  }

  /**
   * Finds the cache directory for a given name.
   * @param options - Configuration options
   * @returns The path to the cache directory or null if not found
   */
  function findCacheDir(options: Options): string | null;
  function findCacheDir(options: Options & { create: true }): string;

  export = findCacheDir;
}
