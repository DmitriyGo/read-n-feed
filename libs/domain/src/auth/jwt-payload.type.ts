export interface JwtPayload {
  id: string;
  email: string;
  roles: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}
