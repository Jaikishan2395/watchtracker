import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author: {
    name: { type: String, required: true },
    role: { type: String, enum: ['Teacher', 'Student'], required: true },
    avatar: { type: String, default: '' }
  },
  content: { type: String, required: true },
  upvotes: [{ type: String }], // Array of user IDs who upvoted
  createdAt: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  isDeleted: { type: Boolean, default: false },
  reportedBy: [{ type: String }], // Array of user IDs who reported
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged', 'removed'], 
    default: 'approved' 
  }
});

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  tags: [{ type: String }],
  author: {
    name: { type: String, required: true },
    role: { type: String, enum: ['Teacher', 'Student'], required: true },
    avatar: { type: String, default: '' }
  },
  upvotes: [{ type: String }], // Array of user IDs who upvoted
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  reportedBy: [{ type: String }], // Array of user IDs who reported
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged', 'removed'], 
    default: 'approved' 
  },
  aiSummary: { type: String },
  aiSuggestions: [{ type: String }]
});

// Indexes for better performance
discussionSchema.index({ tags: 1 });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ lastActivity: -1 });
discussionSchema.index({ author: 1 });

replySchema.index({ createdAt: -1 });
replySchema.index({ author: 1 });

export const Discussion = mongoose.model('Discussion', discussionSchema);
export const Reply = mongoose.model('Reply', replySchema); 