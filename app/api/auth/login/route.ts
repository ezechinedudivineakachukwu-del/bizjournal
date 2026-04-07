import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password)
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return Response.json({ error: 'Invalid email or password.' }, { status: 401 });

    const token = signToken(String(user._id));
    return Response.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, plan: user.plan, company: user.company, role: user.role, usage: user.usage },
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
