/**
 * Points every tarball in package-lock.json at the public npm registry.
 *
 * Installing through a private mirror (e.g. Artifactory) writes the
 * mirror's URLs into the lockfile, and CI, which installs from npmjs, cannot
 * reach them. A mirror serves the same tarballs, so the `integrity` hashes
 * stay valid and only the host and path prefix change:
 *
 *   https://mirror.example/api/npm/remote-npm/@scope/name/-/name-1.0.0.tgz
 *   → https://registry.npmjs.org/@scope/name/-/name-1.0.0.tgz
 *
 * Run by the pre-commit hook: `node scripts/npmjs-lockfile.ts [path]`.
 */
import { readFileSync, writeFileSync } from "node:fs";

const NPMJS = "https://registry.npmjs.org/";
const LOCKFILE = "package-lock.json";
// `node scripts/npmjs-lockfile.ts <path>`: the path follows node and the script
const PATH_ARGUMENT = 2;
const NONE = 0;
// A tarball URL on any other host; keeps `[@scope/]name/-/file.tgz`
const MIRRORED =
  /"resolved": "(?!https:\/\/registry\.npmjs\.org\/)https?:\/\/[^"]*?\/(?<tarball>(?:@[^/"]+\/)?[^/"@]+\/-\/[^/"]+\.tgz)"/gu;

const path = process.argv.at(PATH_ARGUMENT) ?? LOCKFILE;
const lockfile = readFileSync(path, "utf8");
const mirrored = [...lockfile.matchAll(MIRRORED)].length;

if (mirrored > NONE) {
  writeFileSync(
    path,
    lockfile.replaceAll(MIRRORED, `"resolved": "${NPMJS}$<tarball>"`)
  );
  process.stdout.write(`${path}: pointed ${mirrored} tarballs at ${NPMJS}\n`);
}
