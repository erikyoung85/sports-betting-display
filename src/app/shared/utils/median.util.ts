export function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined; // Or throw an error, depending on desired behavior
  }

  // Create a copy to avoid modifying the original array
  const sortedArr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedArr.length / 2);

  if (sortedArr.length % 2 === 1) {
    // Odd length
    return sortedArr[mid];
  } else {
    // Even length
    return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
  }
}
