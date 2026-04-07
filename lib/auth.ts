import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectDB } from './db';
import User from '@/models/User';

const SECRET = process.env.JWT_SECRET!;

export function signToken(userId: string) {
  return jwt.sign({ id: userId }, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function getAuthUser(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return null;
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET) as { id: string };
    await connectDB();
    const user = await User.findById(decoded.id).lean();
    return user || null;
  } catch {
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, ctx: any) => {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return handler(req, ctx, user);
  };
}
