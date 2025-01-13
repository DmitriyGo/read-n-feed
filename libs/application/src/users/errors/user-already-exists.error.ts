export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A user with email '${email}' already exists.`);
    // Maintain stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserAlreadyExistsError);
    }
    this.name = 'UserAlreadyExistsError';
  }
}
