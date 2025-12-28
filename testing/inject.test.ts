import { expect, test } from "bun:test";
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
    expect(isValidSyntax(script)).toBe(true);
    console.log(`${name} is valid syntax`);
  }

  console.log("All scripts are valid syntax");
});

test("expect invalid scripts to be invalid syntax", () => {
  for (const script of invalidScripts) {
    expect(isValidSyntax(script)).toBe(false);
    console.log(`${script} is invalid syntax`);
  }

  console.log("All scripts are invalid syntax");
});
