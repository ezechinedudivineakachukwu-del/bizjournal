export interface User {
  _id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  company?: string;
  role?: string;
  usage: { entriesThisMonth: number; aiMessagesThisMonth: number; resetAt: string };
  createdAt: string;
}

export interface Entry {
  _id: string;
  title: string;
  content: string;
  template: string;
  tags: string[];
  mood: string | null;
  actionItems: string[];
  dealValue?: number;
  dealStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
