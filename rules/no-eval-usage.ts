export default {
  name: "no-eval-usage",
  description: "Patches cannot introduce eval() or Function() constructors",
  severity: "critical",
  tags: ["security", "code-execution"],
  validate: (patch: string) => !patch.includes("eval(") && !patch.includes("new Function(")
};