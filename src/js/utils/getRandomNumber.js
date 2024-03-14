/**
 * Generates a random number within the specified range.
 *
 * @param {number} min - The minimum value of the range
 * @param {number} max - The maximum value of the range
 * @return {number} A random number within the specified range
 */
const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
};

export default getRandomNumber;
