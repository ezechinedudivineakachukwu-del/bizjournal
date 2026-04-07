import mongoose, { Schema, Document } from 'mongoose';

export type EntryTemplate =
  | 'daily-review'
  | 'deal-tracker'
  | 'meeting-notes'
  | 'weekly-review'
  | 'decision-log'
  | 'free-write';

export interface IEntry extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  template: EntryTemplate;
  tags: string[];
  mood: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult' | null;
  dealValue?: number;
  dealStatus?: 'prospecting' | 'negotiating' | 'closed-won' | 'closed-lost';
  actionItems: string[];
  keywords: string[];
}

const EntrySchema = new Schema<IEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 50000 },
    template: {
      type: String,
      enum: ['daily-review', 'deal-tracker', 'meeting-notes', 'weekly-review', 'decision-log', 'free-write'],
      default: 'free-write',
    },
    tags: { type: [String], default: [] },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'challenging', 'difficult', null],
      default: null,
    },
    dealValue: { type: Number },
    dealStatus: {
      type: String,
      enum: ['prospecting', 'negotiating', 'closed-won', 'closed-lost'],
    },
    actionItems: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

EntrySchema.index({ title: 'text', content: 'text', tags: 'text' });
EntrySchema.index({ userId: 1, createdAt: -1 });

EntrySchema.pre('save', function (next) {
  if (this.isModified('content') || this.isModified('title')) {
    const text = `${this.title} ${this.content}`.toLowerCase();
    const stopWords = new Set(['the','a','an','and','or','in','on','at','to','for','of','with','by','is','was','are','were','i','me','my','you','your','we','they','it','this','that','not','so','if','as']);
    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    const freq: Record<string, number> = {};
    words.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1; });
    this.keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([w]) => w);
  }
  next();
});

export default mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema);
