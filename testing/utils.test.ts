import { expect, test } from "bun:test";
import { pickFirstItem, removeNullRecursively } from "../utils.ts";

test("expect pickFirstItem to return the first item", () => {
  expect(pickFirstItem([1])).toBe(1);
});

test(
  "expect pickFirstItem to return an error if no items are provided",
  () => {
    expect(pickFirstItem([]) instanceof Error).toBe(true);
  }
);

test(
  "expect pickFirstItem to return an error if multiple items are provided",
  () => {
    expect(pickFirstItem([1, 2]) instanceof Error).toBe(true);
  }
);

test(
  "expect removeNullRecursively to remove null properties from object",
  () => {
    const obj = { a: 1, b: null, c: "value" };
    const result = removeNullRecursively(obj);
    expect(result).toEqual({ a: 1, c: "value" });
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
    expect(result).toEqual({
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
  expect(result).toEqual([1, 3, 5]);
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
    expect(result).toEqual({
      a: [1, 3],
      c: [{ d: "value" }, { f: 2 }],
    });
  }
);

test(
  "expect removeNullRecursively to return primitive values as-is",
  () => {
    expect(removeNullRecursively(42)).toBe(42);
    expect(removeNullRecursively("string")).toBe("string");
    expect(removeNullRecursively(true)).toBe(true);
    expect(removeNullRecursively(false)).toBe(false);
  }
);

test(
  "expect removeNullRecursively to return null and undefined as-is",
  () => {
    expect(removeNullRecursively(null)).toBe(null);
    expect(removeNullRecursively(undefined)).toBe(undefined);
  }
);

test(
  "expect removeNullRecursively to handle empty objects and arrays",
  () => {
    expect(removeNullRecursively({})).toEqual({});
    expect(removeNullRecursively([])).toEqual([]);
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
    expect(result).toEqual({
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
