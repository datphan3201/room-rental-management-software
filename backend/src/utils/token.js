import jwt from 'jsonwebtoken';

const DEFAULT_JWT_SECRET = 'room-rental-management-local-secret';

function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
