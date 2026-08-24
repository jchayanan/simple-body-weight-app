export type ReadResult<T> = { ok: true; value: T } | { ok: false };

export function attemptRead<T>(read: () => T): ReadResult<T> {
  try {
    return { ok: true, value: read() };
  } catch {
    return { ok: false };
  }
}
