type AsyncFunc<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

export function memoizeFor<TArgs extends any[], TResult>(
  fn: AsyncFunc<TArgs, TResult>,
  ttlMs: number,
): AsyncFunc<TArgs, TResult> {
  const cache = new Map<string, { value: TResult; expiresAt: number }>();

  return async (...args: TArgs): Promise<TResult> => {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, {
      value: result,
      expiresAt: now + ttlMs,
    });

    return result;
  };
}
