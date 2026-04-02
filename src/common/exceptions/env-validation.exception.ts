import { z } from 'zod';

/**
 * EnvValidationError
 *
 * Error thrown when environment validation fails during application bootstrap.
 * Keeps the original Zod issues array available for programmatic inspection.
 */
export class EnvValidationError extends Error {
  public readonly issues: z.core.$ZodIssue[];

  constructor(issues: z.core.$ZodIssue[]) {
    const message = `Environment validation failed:\n${issues
      .map(
        (issue) => `  - ${issue.path.join('.') || '<root>'}: ${issue.message}`,
      )
      .join('\n')}`;

    super(message);

    this.name = 'EnvValidationError';
    this.issues = issues;

    // Fix prototype chain for instanceof checks after transpilation
    Object.setPrototypeOf(this, EnvValidationError.prototype);

    // Clean stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
