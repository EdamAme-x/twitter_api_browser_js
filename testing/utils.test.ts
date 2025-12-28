import { assertEquals } from "@std/assert";
import { pickFirstItem, removeNullRecursively } from "../utils.ts";

Deno.test("expect pickFirstItem to return the first item", () => {
  assertEquals(pickFirstItem([1]), 1);
});

Deno.test(
  "expect pickFirstItem to return an error if no items are provided",
  () => {
    assertEquals(pickFirstItem([]) instanceof Error, true);
  }
);

Deno.test(
  "expect pickFirstItem to return an error if multiple items are provided",
  () => {
    assertEquals(pickFirstItem([1, 2]) instanceof Error, true);
  }
);

Deno.test(
  "expect removeNullRecursively to remove null properties from object",
  () => {
    const obj = { a: 1, b: null, c: "value" };
    const result = removeNullRecursively(obj);
    assertEquals(result, { a: 1, c: "value" });
  }
);

Deno.test(
  "expect removeNullRecursively to remove null from nested objects",
  () => {
    const obj = {
      a: 1,
      b: null,
      c: {
        d: "value",
        e: null,
        f: {
          g: null,
          h: 2,
        },
      },
    };
    const result = removeNullRecursively(obj);
    assertEquals(result, {
      a: 1,
      c: {
        d: "value",
        f: {
          h: 2,
        },
      },
    });
  }
);

Deno.test("expect removeNullRecursively to remove null from arrays", () => {
  const arr = [1, null, 3, null, 5];
  const result = removeNullRecursively(arr);
  assertEquals(result, [1, 3, 5]);
});

Deno.test(
  "expect removeNullRecursively to remove null from nested arrays",
  () => {
    const obj = {
      a: [1, null, 3],
      b: null,
      c: [{ d: "value", e: null }, null, { f: 2 }],
    };
    const result = removeNullRecursively(obj);
    assertEquals(result, {
      a: [1, 3],
      c: [{ d: "value" }, { f: 2 }],
    });
  }
);

Deno.test(
  "expect removeNullRecursively to return primitive values as-is",
  () => {
    assertEquals(removeNullRecursively(42), 42);
    assertEquals(removeNullRecursively("string"), "string");
    assertEquals(removeNullRecursively(true), true);
    assertEquals(removeNullRecursively(false), false);
  }
);

Deno.test(
  "expect removeNullRecursively to return null and undefined as-is",
  () => {
    assertEquals(removeNullRecursively(null), null);
    assertEquals(removeNullRecursively(undefined), undefined);
  }
);

Deno.test(
  "expect removeNullRecursively to handle empty objects and arrays",
  () => {
    assertEquals(removeNullRecursively({}), {});
    assertEquals(removeNullRecursively([]), []);
  }
);

Deno.test(
  "expect removeNullRecursively to handle complex nested structures",
  () => {
    const obj = {
      features: null,
      fieldToggle: null,
      variables: {
        a: 1,
        b: null,
      },
      queryId: "test",
      nested: [
        {
          x: null,
          y: "value",
          z: [1, null, 3],
        },
        null,
      ],
    };
    const result = removeNullRecursively(obj);
    assertEquals(result, {
      variables: {
        a: 1,
      },
      queryId: "test",
      nested: [
        {
          y: "value",
          z: [1, 3],
        },
      ],
    });
  }
);
