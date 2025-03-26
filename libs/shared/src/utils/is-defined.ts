export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export function shouldBeUnreachable(value: never) {
  return value;
}
