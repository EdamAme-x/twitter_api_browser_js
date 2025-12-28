import { assertEquals } from "@std/assert";
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

Deno.test("expect inject scripts to be valid syntax", () => {
  for (const [name, script] of Object.entries(injectScripts)) {
    assertEquals(isValidSyntax(script), true);
    console.log(`${name} is valid syntax`);
  }

  console.log("All scripts are valid syntax");
});

Deno.test("expect invalid scripts to be invalid syntax", () => {
  for (const script of invalidScripts) {
    assertEquals(isValidSyntax(script), false);
    console.log(`${script} is invalid syntax`);
  }

  console.log("All scripts are invalid syntax");
});
