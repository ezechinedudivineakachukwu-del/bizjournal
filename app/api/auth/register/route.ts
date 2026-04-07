import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, company, role } = await req.json();

    if (!name || !email || !password)
      return Response.json({ error: 'Name, email and password are required.' }, { status: 400 });
    if (password.length < 8)
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    if (await User.findOne({ email }))
      return Response.json({ error: 'Email already registered.' }, { status: 409 });

    const user = await User.create({ name, email, password, company, role });
    const token = signToken(String(user._id));

    return Response.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, plan: user.plan, company: user.company, role: user.role, usage: user.usage },
    }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
