import type { AxiosError } from "axios";

/** A single field-level validation error from the API */
export interface FieldError {
  field: string;
  message: string;
  code: string;
}

/** Structured error class for API responses with typed error details */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errorDetails: FieldError[];
  public readonly raw: unknown;

  constructor(
    message: string,
    status: number,
    errorDetails: FieldError[] = [],
    raw?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorDetails = errorDetails;
    this.raw = raw;
  }

  /** True if this is a 4xx client error */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** True if this is a 5xx server error */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /** True if this is a 401 Unauthorized */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True if this is a 403 Forbidden */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True if this is a 404 Not Found */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True if this is a 422 or 400 validation error */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  /** Get the first error message for a given field */
  fieldError(field: string): string | undefined {
    return this.errorDetails.find((e) => e.field === field)?.message;
  }

  /** Get all error messages for a given field */
  fieldErrors(field: string): string[] {
    return this.errorDetails
      .filter((e) => e.field === field)
      .map((e) => e.message);
  }

  /** Convert to a plain object suitable for form-level errors */
  toFormErrors(): Record<string, string | string[]> {
    const errors: Record<string, string | string[]> = {};
    for (const { field, message } of this.errorDetails) {
      if (errors[field]) {
        errors[field] = [...(Array.isArray(errors[field]) ? errors[field] : [errors[field]]), message];
      } else {
        errors[field] = message;
      }
    }
    return errors;
  }

  /** Extract an ApiError from an Axios error, returning a default fallback on failure */
  static fromAxiosError(error: AxiosError<{ message?: string; errorDetails?: FieldError[] }>): ApiError {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message = data?.message ?? error.message ?? "An unexpected error occurred";
    const details = data?.errorDetails ?? [];
    return new ApiError(message, status, details, error);
  }

  /** Convenience: create a 400 Bad Request ApiError */
  static badRequest(message = "Bad request"): ApiError {
    return new ApiError(message, 400);
  }

  /** Convenience: create a 401 Unauthorized ApiError */
  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(message, 401);
  }

  /** Convenience: create a 404 Not Found ApiError */
  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(message, 404);
  }

  /** Convenience: create a 500 Internal Server Error ApiError */
  static internal(message = "Internal server error"): ApiError {
    return new ApiError(message, 500);
  }
}
