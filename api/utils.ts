export function stringOrNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return `'${value}'`;
}
