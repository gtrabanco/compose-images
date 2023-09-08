// sharp can resize proportional but we need to retrieve width and height with metadata
// this will change because I didn't know that when I made this function
export function resizeToProportional(currentSizes: Area, maxSizes: Area): Area {
  let coefficient = 1;
  let biggerIndex = 0; // If equal we will use first index in array
  let lowerIndex = 1;
  const [currentW, currentH] = currentSizes;
  if (currentH > currentW && currentH !== 0) {
    biggerIndex = 1;
    lowerIndex = 0;
  }

  const biggerThanLimitIndexes = currentSizes.map((v, index) => [v, index]).filter((n, index) => n[0] > maxSizes[index]).map((v) => v[1]);
  if (biggerThanLimitIndexes.length > 0) {
    biggerIndex = biggerThanLimitIndexes.length > 1 ? biggerIndex : biggerThanLimitIndexes[0];
    lowerIndex = biggerIndex === 0 ? 1 : 0;
    coefficient = maxSizes[biggerIndex] / currentSizes[biggerIndex];
  }

  if (currentSizes.every((n, index) => n < maxSizes[index])) {
    const lowerIndex = biggerIndex === 0 ? 1 : 0;
    coefficient = maxSizes[biggerIndex] / currentSizes[biggerIndex];
  }

  if (coefficient !== 1 && coefficient !== 0) {
    const result: Area = [] as unknown as Area;
    result[biggerIndex] = maxSizes[biggerIndex];
    result[lowerIndex] = currentSizes[lowerIndex] * coefficient;

    return result.map(Math.floor) as Area;
  }

  return currentSizes.map(Math.floor) as Area;
}