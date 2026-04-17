import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
  BROWSERSLIST_IGNORE_OLD_DATA: "true",
};

const result = spawnSync("eslint .", {
  encoding: "utf8",
  env,
  shell: true,
});

if (result.error) {
  throw result.error;
}

const warningPattern = /\[baseline-browser-mapping\].*accurate Baseline data/i;
const filteredStdout = (result.stdout ?? "")
  .split(/\r?\n/)
  .filter((line) => !warningPattern.test(line))
  .join("\n");
const filteredStderr = (result.stderr ?? "")
  .split(/\r?\n/)
  .filter((line) => !warningPattern.test(line))
  .join("\n");

if (filteredStdout) {
  process.stdout.write(`${filteredStdout}\n`);
}

if (filteredStderr) {
  process.stderr.write(`${filteredStderr}\n`);
}

process.exit(result.status ?? 1);
