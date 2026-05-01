import "server-only";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, "AUTHENTICATION_REQUIRED", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, "AUTHORIZATION_FAILED", 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_FAILED", 422);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please wait and try again.") {
    super(message, "RATE_LIMITED", 429);
  }
}

export class TimeoutError extends AppError {
  constructor(message = "The operation timed out.") {
    super(message, "OPERATION_TIMED_OUT", 504);
  }
}

export function toPublicError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("Something went wrong. Please try again.", "INTERNAL_ERROR", 500);
}
