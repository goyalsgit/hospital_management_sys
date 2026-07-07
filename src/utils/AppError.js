// Custom error class — extends built-in Error
// Adds a status code so the global error handler knows what HTTP status to send

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);            // calls Error constructor with message
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // distinguishes from programming bugs

    // Captures stack trace (for debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// Usage in controllers:
// throw new AppError("Doctor not found", 404)
// throw new AppError("Email already exists", 409)
