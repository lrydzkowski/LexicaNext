interface ValidationErrorItem {
  propertyName: string;
  errorMessage: string;
  attemptedValue?: unknown;
  severity: string;
}

interface ProblemDetails {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  errors?: ValidationErrorItem[];
}

const VALIDATION_ERRORS_TYPE = 'validation-errors';
const RATE_LIMIT_EXCEEDED_TYPE = 'rate-limit-exceeded';

export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join(' '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

function isValidationProblem(error: unknown): error is ProblemDetails {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const problemDetails = error as ProblemDetails;

  return problemDetails.type === VALIDATION_ERRORS_TYPE && Array.isArray(problemDetails.errors);
}

export function parseValidationErrors(error: unknown): string[] | null {
  if (!isValidationProblem(error)) {
    return null;
  }

  return error.errors!.map((item) => item.errorMessage);
}

export class RateLimitError extends Error {
  constructor() {
    super('Too many requests. Please wait a moment and try again.');
    this.name = 'RateLimitError';
  }
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof RateLimitError;
}

function isRateLimitProblem(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return (error as ProblemDetails).type === RATE_LIMIT_EXCEEDED_TYPE;
}

export function throwApiError(error: unknown, fallbackMessage: string): never {
  const validationErrors = parseValidationErrors(error);
  if (validationErrors) {
    throw new ValidationError(validationErrors);
  }

  if (isRateLimitProblem(error)) {
    throw new RateLimitError();
  }

  throw new Error(fallbackMessage);
}
