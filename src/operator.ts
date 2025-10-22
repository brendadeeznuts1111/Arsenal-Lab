import { watch } from "@kubernetes/client-node";
import { $ } from "bun";
watch("gate.bun.sh", "v1", "patches").on("ADDED", async (obj) => {
  const { package: pkg, rollout } = obj.spec;
  await $ `bun run patch:ctl rollout ${pkg} ${rollout}`;
});