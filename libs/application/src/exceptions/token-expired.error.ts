export class TokenExpiredError extends Error {
  constructor() {
    super('Refresh token is expired or not found.');
    this.name = 'TokenExpiredError';
  }
}
