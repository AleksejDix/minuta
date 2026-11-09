/**
 * Imports every published entry point of every package in plain Node, the
 * way a server-side user would. Bundlers resolve imports Node's ESM resolver
 * rejects (e.g. a dependency subpath without `.js`), so the test suite alone
 * cannot catch them.
 *
 * Run after the build with `npm run check:node-esm`.
 */
import { entryPoints } from "./entry-points.ts";

const NONE = 0;
const FAILURE = 1;

async function failures(): Promise<string[]> {
  const all = entryPoints();
  const results = await Promise.allSettled(
    all.map(async (specifier): Promise<unknown> => {
      const module: unknown = await import(specifier);
      return module;
    })
  );
  return results.flatMap(
    (result: Readonly<PromiseSettledResult<unknown>>, index) => {
      if (result.status === "fulfilled") {
        return [];
      }
      return [`${all[index] ?? ""}: ${String(result.reason)}`];
    }
  );
}

function report(failed: readonly string[]): void {
  if (failed.length > NONE) {
    process.stderr.write(
      `${String(failed.length)} entry points fail to import in Node:\n  ${failed.join("\n  ")}\n`
    );
    process.exitCode = FAILURE;
  } else {
    process.stdout.write("Every entry point imports in plain Node.\n");
  }
}

report(await failures());
