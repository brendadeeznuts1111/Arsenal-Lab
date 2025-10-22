# 🛡️ Bun System Gate – Feedback & Bug Reports

## ✅ Quick Check Before You Post
1. **Upgrade Bun & Gate**
   ```bash
   bun upgrade
   curl -sSL https://raw.githubusercontent.com/brendadeeznuts1111/Arsenal-Lab/main/scripts/remote-gate.sh  | bash
   ```
2. **Read the error** – it tells you **exactly** what's wrong.

## 🐞 Report a Bug / Request a Feature
Open an issue **in this repo** (Arsenal-Lab) and **use the template below**.

---

### **Bug Report Template** (copy-paste into issue)
```markdown
## 🐞 Bug Report - Bun System Gate

### ✅ Upgrade Check
- [ ] I ran `bun upgrade` and the bug still exists
- [ ] I re-bootstrapped the latest gate script

### 🎯 What happened?
<!-- Clear, concise description -->

### 🔍 Steps to reproduce
<!-- Minimal code/commands -->

### 🛡️ Gate Output
<!-- Paste the full error from gate.js -->

### 💻 Environment
- Bun version: `bun --version`
- OS: `uname -mprs` (Linux/macOS) or PowerShell command (Windows)
- Gate version: `git describe --tags --abbrev=0`

### 📸 Screenshots (if visual)
<!-- Drag image here -->
```

### **✨ Feature Request Template**
```markdown
## ✨ Feature Request - Bun System Gate

### 💡 What do you want?
<!-- Clear, concise description -->

### 🎯 Why is this needed?
<!-- Use-case, pain-point, benefit -->

### 🛡️ Current workaround (if any)
<!-- What you do today -->

### 🚀 Suggested solution (if you have one)
<!-- Optional -->
```

---

## 💬 **Discord (General Chat)**
[Join Arsenal Lab Discord](https://discord.com/invite/CXdq2DP29u) – **#bun-gate** channel.

## 📧 **Direct Feedback via CLI**
```bash
# Quick text feedback
bun feedback "Love the new canary rollout!"

# Attach files
bun feedback report.txt details.log

# Email + feedback
echo "please document X" | bun feedback --email you@example.com

# Built-in Arsenal Lab feedback (requires GITHUB_TOKEN)
bun run feedback "Gate blocked a false positive"
```

---

## 🔗 **Pre-filled GitHub Issues**
**One-click bug report:**  
https://github.com/brendadeeznuts1111/Arsenal-Lab/issues/new?template=bun-gate-bug.yml

**One-click feature request:**  
https://github.com/brendadeeznuts1111/Arsenal-Lab/issues/new?template=bun-gate-feature.yml

---

## 🚨 **Emergency Escalation**
If the gate **blocks you completely** and you **must ship now**:

```bash
bun run gate:override --reason="EMERGENCY: production down"
# (logged, temporary, 1-hour window)
```

Then open an **urgent** issue – we prioritize emergencies.

---

**Thank you for helping make Bun System Gate even better!** 🛡️

---

## 📋 **General Bun Feedback** (for Bun core issues)

> For general Bun issues not related to System Gate governance

Whether you've found a bug, have a performance issue, or just want to suggest an improvement, here's how you can open a helpful issue:

<Callout icon="discord">
  For general questions, please join our [Discord](https://discord.com/invite/CXdq2DP29u).
</Callout>

## Reporting Issues

<Steps>
  <Step title="Upgrade Bun">
    Try upgrading Bun to the latest version with `bun upgrade`. This might fix your problem without having to open an issue.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun upgrade
    ```

    You can also try the latest canary release, which includes the most recent changes and bug fixes that haven't been released in a stable version yet.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun upgrade --canary

    # To revert back to the stable
    bun upgrade --stable
    ```

    If the issue still persists after upgrading, continue to the next step.
  </Step>

  <Step title="Review Existing Issues">
    First take a minute to check if the issue has already been reported. Don't open a new issue if it has already been reported, it saves time for everyone and helps us focus on fixing things faster.

    * 🔍 [**Search existing issues**](https://github.com/oven-sh/bun/issues)
    * 💬 [**Check discussions**](https://github.com/oven-sh/bun/discussions)

    If you find a related issue, add a 👍 reaction or comment with extra details instead of opening a new one.
  </Step>

  <Step title="Report the Issue">
    If no one has reported the issue, please open a new issue or suggest an improvement.

    * 🐞 [**Report a Bug**](https://github.com/oven-sh/bun/issues/new?template=2-bug-report.yml)
    * ⚡ [**Suggest an Improvement**](https://github.com/oven-sh/bun/issues/new?template=4-feature-request.yml)

    Please provide as much detail as possible, including:

    * A clear and concise title
    * A code example or steps to reproduce the issue
    * The version of Bun you are using (run `bun --version`)
    * A detailed description of the issue (what happened, what you expected to happen, and what actually happened)
    * The operating system and version you are using
      <Note>
        * For MacOS and Linux: copy the output of `uname -mprs`
        * For Windows: copy the output of this command in the powershell console:
          ```powershell  theme={"theme":{"light":"github-light","dark":"dracula"}}
          	"$([Environment]::OSVersion | ForEach-Object VersionString) $(if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" })"
          ```
      </Note>
  </Step>
</Steps>

The Bun team will review the issue and get back to you as soon as possible!

***

## Use `bun feedback`

Alternatively, you can use `bun feedback` to share feedback, bug reports, and feature requests directly with the Bun team.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun feedback "Love the new release!"
bun feedback report.txt details.log
echo "please document X" | bun feedback --email you@example.com
```

You can provide feedback as text arguments, file paths, or piped input.

***

## CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun feedback [options] [feedback text ... | files ...]
```

### Contact Information

<ParamField path="--email" type="string">
  Set the email address used for this submission. Alias: <code>-e</code>
</ParamField>

### Help

<ParamField path="--help" type="boolean">
  Show this help message and exit. Alias: <code>-h</code>
</ParamField>

</user_query>
</xai:function_call">Wrote contents to docs/FEEDBACK.md.
