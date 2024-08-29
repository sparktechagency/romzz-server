const nonEmptyArray = (array: string[]) => array?.length > 0;

const nonEmptyStrings = (strings: string[]) =>
  strings?.every((str) => str?.trim() !== '');

export { nonEmptyArray, nonEmptyStrings };
