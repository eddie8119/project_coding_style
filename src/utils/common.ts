/**
 * Sorts an array of objects by a specified key in ascending order.
 *
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @param {string} key - The key to sort the objects by.
 * @returns {number} - Returns -1 if `a[key]` is less than `b[key]`, 1 if `a[key]` is greater than `b[key]`, and 0 if they are equal.
 */
export function sortByKey(a: any, b: any, key: string): number {
  const valueA = a[key].toUpperCase();
  const valueB = b[key].toUpperCase();
  if (valueA < valueB) {
    return -1;
  }
  if (valueA > valueB) {
    return 1;
  }
  return 0;
}

const regex = /^(.*?)(?=_measurement|_calibration|$)/;
/**
 * Cleans the given ID by extracting a specific part of it using a regular expression.
 *
 * @param {string} id - The ID to be cleaned.
 * @returns {string} - The extracted part of the ID if it matches the regular expression, otherwise an empty string.
 */
export function cleanID(id: string): string {
  const match = regex.exec(id);
  return match ? match[1] : ''; // Return the matched group or an empty string if no match
}

/**
 * Converts a timestamp to a formatted date string.
 *
 * @param {string} ts - The timestamp to convert. Can be a number or a string representing the number of milliseconds since the Unix Epoch.
 * @returns {string} The formatted date string in the format "YYYY/MM/DD HH:MM:SS".
 */
export function datetimeToString(ts: string) {
  const date = new Date(parseInt(ts));
  return `${String(date.getFullYear())}/\
  ${String(date.getMonth() + 1).padStart(2, '0')}/\
  ${String(date.getDate()).padStart(2, '0')} \
  ${String(date.getHours()).padStart(2, '0')}:\
  ${String(date.getMinutes()).padStart(2, '0')}:\
  ${String(date.getSeconds()).padStart(2, '0')}`;
}

/**
 * Capitalizes the first letter of the given string.
 *
 * @param {string} val - The string to capitalize.
 * @returns {string} - The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(val: string): string {
  if (typeof val !== 'string') {
    throw new TypeError('Expected a string');
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Compares two objects and returns an object containing the differences.
 *
 * @param {Object} originalObj - The original object to compare.
 * @param {Object} updatedObj - The updated object to compare.
 * @returns {Object} An object containing the keys and values from objB that are different from objA.
 */
export function getDifferences<T extends object>(
  originalObj: T,
  updatedObj: Partial<T>
): Partial<T> {
  const differences: Partial<T> = {};

  for (const key in updatedObj) {
    if (
      Object.prototype.hasOwnProperty.call(originalObj, key) &&
      originalObj[key as keyof T] !== updatedObj[key as keyof T] &&
      updatedObj[key as keyof T] !== undefined
    ) {
      differences[key as keyof T] = updatedObj[key as keyof T];
    }
  }

  return differences;
}
