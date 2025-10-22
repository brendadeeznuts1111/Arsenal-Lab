#!/usr/bin/env bun
import { $ } from "bun";
const [cmd, file] = process.argv.slice(2);
if (cmd === "sign") await $ `cosign sign-blob --yes ${file} --output-signature ${file}.sig`;
if (cmd === "verify") await $ `cosign verify-blob ${file} --signature ${file}.sig`;
