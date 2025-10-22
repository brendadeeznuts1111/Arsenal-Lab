const BAD = ["md5", "sha1", "rapidhash"];
export function validate(ctx: any) {
  const ok = !BAD.some(b => ctx.addedContent.includes(b));
  return { isValid: ok, details: ok ? "" : "insecure crypto" };
};