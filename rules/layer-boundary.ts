export function validate(ctx: any) {
  const ok = !ctx.addedContent.match(/froms+["']./db/);
  return { isValid: ok, details: ok ? "" : "ui→db violation" };
};