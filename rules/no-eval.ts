export function validate(ctx: any) {
  const ok = !ctx.addedContent.includes("eval(");
  return { isValid: ok, details: ok ? "" : "eval() detected" };
};