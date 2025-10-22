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
