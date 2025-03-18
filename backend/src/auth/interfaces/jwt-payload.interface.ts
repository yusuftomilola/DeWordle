export interface JwtPayload {
  sub: number; // Subject (user ID)
  email: string; // User's email
  role: string; // User's role
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}
