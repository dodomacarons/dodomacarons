import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const authMiddleware = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_IDENTIFIER,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});
