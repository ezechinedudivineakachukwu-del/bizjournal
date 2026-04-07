import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Entry from '@/models/Entry';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();
  const entry = await Entry.findOne({ _id: params.id, userId: user._id });
  if (!entry) return Response.json({ error: 'Entry not found.' }, { status: 404 });
  return Response.json({ entry });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const entry = await Entry.findOneAndUpdate(
    { _id: params.id, userId: user._id },
    body,
    { new: true, runValidators: true }
  );
  if (!entry) return Response.json({ error: 'Entry not found.' }, { status: 404 });
  return Response.json({ entry });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();
  const entry = await Entry.findOneAndDelete({ _id: params.id, userId: user._id });
  if (!entry) return Response.json({ error: 'Entry not found.' }, { status: 404 });
  return Response.json({ message: 'Deleted.' });
}
