#!/usr/bin/env bun
import { $ } from "bun";
const spdx = { spdxVersion: "SPDX-2.3", dataLicense: "CC0-1.0", packages: [] };
for (const p of await $ `find patches -name "*.patch"`.text().split("\n").filter(Boolean)) {
  const hash = await $ `sha256sum ${p}`.text();
  spdx.packages.push({ name: p, checksums: [{ algorithm: "SHA256", checksumValue: hash.split(" ")[0] }] });
}
console.log(JSON.stringify(spdx, null, 2));
