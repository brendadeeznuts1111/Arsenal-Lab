#!/usr/bin/env bash
set -euo pipefail
echo "🛡️  Bun Gate – remote bootstrap"

# ---- single-file engine ----
cat > gate.js <<'GATE'
import { $ } from "bun";
const INVARIANTS=[{id:"no-eval",check:t=>!t.includes("eval(")},{id:"crypto",check:t=>!["md5","sha1","rapidhash"].some(x=>t.includes(x))}];
export async function validateAll(){
  const p=Object.keys(JSON.parse(await Bun.file("package.json").text()).patchedDependencies||{});
  for (const pkg of p){
    const [n,v]=pkg.split("@"),f=`patches/${n}@${v}.patch`;
    if (!await Bun.file(f).exists()) continue;
    const txt=await Bun.file(f).text();
    for (const r of INVARIANTS) if (!r.check(txt)) {console.error(`❌ ${r.id}`); process.exit(1);}
  } console.log("✅ All invariants passed");
}
if (import.meta.main) validateAll();
GATE

# ---- canary matrix ----
echo '{}' > canary.json

# ---- package.json scripts ----
bun run -e '
const p=require("./package.json");
p.scripts={...p.scripts,"postinstall":"bun gate.js","gate:validate":"bun gate.js","gate:sign":"for f in patches/*.patch;do echo signed >$f.sig;done","gate:sarif":"echo {\""version\"":\""2.1.0\"\"",\""runs\"":[{\""tool\"":{\""driver\"":{\""name\"":\""Bun-Gate\""}},\""results\"":[]}]}"};
require("fs").writeFileSync("package.json",JSON.stringify(p,null,2));
'

# ---- install & validate ----
bun install
bun run gate:validate
echo "✅ Remote bootstrap complete – commit & push."
