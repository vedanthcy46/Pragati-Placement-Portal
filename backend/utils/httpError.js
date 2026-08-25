// Matches errorMiddleware.js, which reads err.status and err.message.
// Usage: throw httpError(404, "Student profile not found");
export const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
