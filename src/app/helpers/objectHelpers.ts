export const excludeKeys = <T extends Record<string, unknown>>(
  obj: T,
  keysToExclude: (keyof T)[],
): Partial<T> => {
  // Create a filtered array of [key, value] pairs
  const filteredEntries = Object.entries(obj)
    .filter(([key]) => !keysToExclude.includes(key as keyof T))
    // Assert the types correctly
    .map(([key, value]) => [key as keyof T, value] as [keyof T, T[keyof T]]);

  // Convert the filtered entries back into an object
  return Object.fromEntries(filteredEntries) as Partial<T>;
};
