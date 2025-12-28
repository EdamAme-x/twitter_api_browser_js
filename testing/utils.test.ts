import { test } from "node:test";
import assert from "node:assert";
import { pickFirstItem, removeNullRecursively } from "../utils.ts";

test("expect pickFirstItem to return the first item", () => {
  assert.strictEqual(pickFirstItem([1]), 1);
});

test(
  "expect pickFirstItem to return an error if no items are provided",
  () => {
    assert.strictEqual(pickFirstItem([]) instanceof Error, true);
  }
);

test(
  "expect pickFirstItem to return an error if multiple items are provided",
  () => {
    assert.strictEqual(pickFirstItem([1, 2]) instanceof Error, true);
  }
);

test(
  "expect removeNullRecursively to remove null properties from object",
  () => {
    const obj = { a: 1, b: null, c: "value" };
    const result = removeNullRecursively(obj);
    assert.deepStrictEqual(result, { a: 1, c: "value" });
  }
);

test(
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
    assert.deepStrictEqual(result, {
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

test("expect removeNullRecursively to remove null from arrays", () => {
  const arr = [1, null, 3, null, 5];
  const result = removeNullRecursively(arr);
  assert.deepStrictEqual(result, [1, 3, 5]);
});

test(
  "expect removeNullRecursively to remove null from nested arrays",
  () => {
    const obj = {
      a: [1, null, 3],
      b: null,
      c: [{ d: "value", e: null }, null, { f: 2 }],
    };
    const result = removeNullRecursively(obj);
    assert.deepStrictEqual(result, {
      a: [1, 3],
      c: [{ d: "value" }, { f: 2 }],
    });
  }
);

test(
  "expect removeNullRecursively to return primitive values as-is",
  () => {
    assert.strictEqual(removeNullRecursively(42), 42);
    assert.strictEqual(removeNullRecursively("string"), "string");
    assert.strictEqual(removeNullRecursively(true), true);
    assert.strictEqual(removeNullRecursively(false), false);
  }
);

test(
  "expect removeNullRecursively to return null and undefined as-is",
  () => {
    assert.strictEqual(removeNullRecursively(null), null);
    assert.strictEqual(removeNullRecursively(undefined), undefined);
  }
);

test(
  "expect removeNullRecursively to handle empty objects and arrays",
  () => {
    assert.deepStrictEqual(removeNullRecursively({}), {});
    assert.deepStrictEqual(removeNullRecursively([]), []);
  }
);

test(
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
    assert.deepStrictEqual(result, {
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
