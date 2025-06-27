export const trySafely = async <R>(
  p: Promise<R> | (() => Promise<R>) | (() => R),
): Promise<[error: Error, undefined] | [null, result: R]> => {
  try {
    const r = await (typeof p === 'function' ? p() : p);
    return [null, r];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    const error = new Error();
    error.cause = e;
    return [error, undefined];
  }
};
