type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type JsonSerializable<T> = T extends Date
  ? number
  : T extends Function | symbol | undefined
    ? never
    : T extends string | number | boolean | null
      ? T
      : T extends Array<infer U>
        ? JsonSerializable<U>[]
        : T extends object
          ? { [K in keyof T]: JsonSerializable<T[K]> }
          : never;

export const serialize = <T>(input: T): JsonSerializable<T> => {
  const convert = (value: any): any => {
    if (value instanceof Date) return value.getTime();
    if (Array.isArray(value)) return value.map(convert);
    if (value && typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        const v = value[key];
        if (
          typeof v !== 'function' &&
          typeof v !== 'symbol' &&
          v !== undefined
        ) {
          result[key] = convert(v);
        }
      }
      return result;
    }
    return value;
  };
  return convert(input);
};
