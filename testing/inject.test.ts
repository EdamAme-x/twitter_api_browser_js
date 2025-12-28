import { test } from "node:test";
import assert from "node:assert";
import * as injectScripts from "../inject.ts";

const invalidScripts = [
  "async () => {",
  "const a = ;",
];

const isValidSyntax = (script: string): boolean => {
  try {
    new Function(script);
    return true;
  } catch {
    return false;
  }
};

test("expect inject scripts to be valid syntax", () => {
  for (const [name, script] of Object.entries(injectScripts)) {
    assert.strictEqual(isValidSyntax(script), true);
    console.log(`${name} is valid syntax`);
  }

  console.log("All scripts are valid syntax");
});

test("expect invalid scripts to be invalid syntax", () => {
  for (const script of invalidScripts) {
    assert.strictEqual(isValidSyntax(script), false);
    console.log(`${script} is invalid syntax`);
  }

  console.log("All scripts are invalid syntax");
});
