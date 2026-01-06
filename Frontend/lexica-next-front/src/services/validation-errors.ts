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

export function throwApiError(error: unknown, fallbackMessage: string): never {
  const validationErrors = parseValidationErrors(error);
  if (validationErrors) {
    throw new ValidationError(validationErrors);
  }

  throw new Error(fallbackMessage);
}
