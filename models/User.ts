import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Plan } from '@/lib/plans';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usage: { entriesThisMonth: number; aiMessagesThisMonth: number; resetAt: Date };
  company?: string;
  role?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    usage: {
      entriesThisMonth: { type: Number, default: 0 },
      aiMessagesThisMonth: { type: Number, default: 0 },
      resetAt: { type: Date, default: () => new Date() },
    },
  },
  { timestamps: true }
);

// Reset usage monthly
UserSchema.pre('save', function (next) {
  const now = new Date();
  const reset = this.usage.resetAt;
  if (now.getMonth() !== reset.getMonth() || now.getFullYear() !== reset.getFullYear()) {
    this.usage.entriesThisMonth = 0;
    this.usage.aiMessagesThisMonth = 0;
    this.usage.resetAt = now;
  }
  next();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
