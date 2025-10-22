export default {
  name: "no-process-env",
  description: "Patches cannot introduce new process.env access",
  severity: "high",
  tags: ["security", "environment"],
  validate: (patch: string, pkg: string) => {
    const matches = patch.match(/process.env.[A-Z_]/g);
    if (!matches) return true;
    const allowed = ["test", "spec", "config", "env"].some(p => pkg.includes(p));
    return allowed;
  }
};