import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function createToken(userId: string) {
  return sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}
