/**
 * Async handler middleware to avoid try-catch blocks in route handlers
 * This allows for cleaner controller code by removing repetitive try-catch blocks
 * 
 * @param {Function} fn The async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;