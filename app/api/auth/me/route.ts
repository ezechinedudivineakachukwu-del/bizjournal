import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  return Response.json({ user });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { connectDB } = await import('@/lib/db');
    const User = (await import('@/models/User')).default;
    await connectDB();
    const { name, company, role } = await req.json();
    const updated = await User.findByIdAndUpdate(
      user._id, { name, company, role }, { new: true }
    );
    return Response.json({ user: { _id: updated!._id, name: updated!.name, email: updated!.email, plan: updated!.plan, company: updated!.company, role: updated!.role, usage: updated!.usage } });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
