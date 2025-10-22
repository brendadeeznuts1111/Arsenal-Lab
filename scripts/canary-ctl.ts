#!/usr/bin/env bun
import { parseArgs } from "util";
const { values } = parseArgs({ args: process.argv.slice(2), options: { promote: {}, demote: {}, rollout: {}, list: { type: "boolean" } } });
if (values.list) console.table(await Bun.file("config/canary-matrix.yml").json());
if (values.promote) await setRollout(values.promote, 100);
if (values.demote) await setRollout(values.demote, 5);
if (values.rollout) {
  const [pkg, pct] = (values.rollout as string).split(" ");
  await setRollout(pkg, parseInt(pct));
}
async function setRollout(pkg: string, pct: number) {
  const cfg = await Bun.file("config/canary-matrix.yml").json();
  cfg.patches[pkg] = { stage: pct === 100 ? "stable" : "canary", rollout: pct };
  await Bun.write("config/canary-matrix.yml", JSON.stringify(cfg, null, 2));
  console.log(`✅ ${pkg} now ${pct}% canary`);
}