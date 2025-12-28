export const pickFirstItem = <T>(
  values: T[],
  itemName: string = "item",
): T | Error => {
  if (values.length === 0) {
    return new Error(`No ${itemName} provided`);
  } else if (values.length > 1) {
    return new Error(`Multiple ${itemName} provided`);
  }

  return values[0];
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

type RemoveNullRecursively<T> = T extends null
  ? never
  : T extends (infer U)[]
  ? RemoveNullRecursively<U>[]
  : T extends Record<string, unknown>
  ? {
      [K in keyof T as T[K] extends null ? never : K]: RemoveNullRecursively<T[K]>;
    }
  : T;

export const removeNullRecursively = <T>(obj: T): RemoveNullRecursively<T> => {
  if (obj === null || obj === undefined) {
    return obj as RemoveNullRecursively<T>;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeNullRecursively(item))
      .filter((item) => item !== null) as RemoveNullRecursively<T>;
  }

  if (typeof obj === "object") {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null) {
        const cleanedValue = removeNullRecursively(value);
        if (cleanedValue !== null) {
          result[key] = cleanedValue;
        }
      }
    }
    return result as RemoveNullRecursively<T>;
  }

  return obj as RemoveNullRecursively<T>;
};

