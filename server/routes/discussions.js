import express from 'express';
import { Discussion, Reply } from '../models/Discussion.js';
import { AIService } from '../services/aiService.js';

const router = express.Router();

// Get all discussions
router.get('/', async (req, res) => {
  try {
    const discussions = await Discussion.find({ isDeleted: false })
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: {
          path: 'replies',
          match: { isDeleted: false }
        }
      })
      .sort({ lastActivity: -1 });

    // Check for inactive discussions
    const inactiveDiscussions = await AIService.detectInactiveDiscussions(discussions);

    res.json({
      discussions: discussions.map(d => ({
        ...d.toObject(),
        isInactive: inactiveDiscussions.some(id => id._id.toString() === d._id.toString())
      })),
      inactiveCount: inactiveDiscussions.length
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Create new discussion
router.post('/', async (req, res) => {
  try {
    const { title, prompt, tags, author } = req.body;

    if (!title || !prompt || !author) {
      return res.status(400).json({ error: 'Title, prompt, and author are required' });
    }

    // AI moderation
    const moderationStatus = await AIService.moderateContent(`${title} ${prompt}`, 'discussion');

    const discussion = new Discussion({
      title,
      prompt,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author,
      moderationStatus
    });

    await discussion.save();

    // Emit real-time update
    req.app.get('io').emit('discussion:created', discussion);

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Get discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: {
          path: 'replies',
          match: { isDeleted: false }
        }
      });

    if (!discussion || discussion.isDeleted) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Add reply to discussion
router.post('/:id/replies', async (req, res) => {
  try {
    const { content, author, parentReplyId } = req.body;
    const discussionId = req.params.id;

    if (!content || !author) {
      return res.status(400).json({ error: 'Content and author are required' });
    }

    // AI moderation
    const moderationStatus = await AIService.moderateContent(content, 'reply');

    const reply = new Reply({
      content,
      author,
      moderationStatus
    });

    await reply.save();

    if (parentReplyId) {
      // Nested reply
      const parentReply = await Reply.findById(parentReplyId);
      if (parentReply) {
        parentReply.replies.push(reply._id);
        await parentReply.save();
      }
    } else {
      // Top-level reply
      const discussion = await Discussion.findById(discussionId);
      discussion.replies.push(reply._id);
      discussion.lastActivity = new Date();
      await discussion.save();
    }

    // Emit real-time update
    req.app.get('io').emit('reply:added', { discussionId, reply });

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Upvote discussion or reply
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId, replyId } = req.body;
    const discussionId = req.params.id;

    if (replyId) {
      // Upvote reply
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      const upvoteIndex = reply.upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        reply.upvotes.splice(upvoteIndex, 1); // Remove upvote
      } else {
        reply.upvotes.push(userId); // Add upvote
      }
      await reply.save();
    } else {
      // Upvote discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      const upvoteIndex = discussion.upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        discussion.upvotes.splice(upvoteIndex, 1); // Remove upvote
      } else {
        discussion.upvotes.push(userId); // Add upvote
      }
      await discussion.save();
    }

    // Emit real-time update
    req.app.get('io').emit('upvote:updated', { discussionId, replyId, userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating upvote:', error);
    res.status(500).json({ error: 'Failed to update upvote' });
  }
});

// Report discussion or reply
router.post('/:id/report', async (req, res) => {
  try {
    const { userId, replyId, reason } = req.body;
    const discussionId = req.params.id;

    if (replyId) {
      // Report reply
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      if (!reply.reportedBy.includes(userId)) {
        reply.reportedBy.push(userId);
        await reply.save();
      }
    } else {
      // Report discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      if (!discussion.reportedBy.includes(userId)) {
        discussion.reportedBy.push(userId);
        await discussion.save();
      }
    }

    // Emit real-time update for moderators
    req.app.get('io').emit('content:reported', { discussionId, replyId, userId, reason });

    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

// AI: Generate discussion starters
router.post('/ai/suggest', async (req, res) => {
  try {
    const { topic, context } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const suggestions = await AIService.generateDiscussionStarters(topic, context);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// AI: Summarize discussion
router.post('/:id/summarize', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: {
          path: 'replies',
          match: { isDeleted: false }
        }
      });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const summary = await AIService.summarizeDiscussion(discussion, discussion.replies);
    
    // Save summary to discussion
    discussion.aiSummary = summary;
    await discussion.save();

    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing discussion:', error);
    res.status(500).json({ error: 'Failed to summarize discussion' });
  }
});

// AI: Generate engagement suggestions
router.post('/:id/engagement-suggestions', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate({
        path: 'replies',
        match: { isDeleted: false }
      });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const suggestions = await AIService.generateEngagementSuggestions(discussion, discussion.replies);
    
    // Save suggestions to discussion
    discussion.aiSuggestions = suggestions;
    await discussion.save();

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating engagement suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Moderation: Delete discussion or reply
router.delete('/:id', async (req, res) => {
  try {
    const { replyId } = req.query;
    const discussionId = req.params.id;

    if (replyId) {
      // Delete reply
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      reply.isDeleted = true;
      reply.moderationStatus = 'removed';
      await reply.save();
    } else {
      // Delete discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      discussion.isDeleted = true;
      discussion.moderationStatus = 'removed';
      await discussion.save();
    }

    // Emit real-time update
    req.app.get('io').emit('content:deleted', { discussionId, replyId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Get reported content for moderation
router.get('/moderation/reported', async (req, res) => {
  try {
    const reportedDiscussions = await Discussion.find({
      'reportedBy.0': { $exists: true },
      isDeleted: false
    }).populate('replies');

    const reportedReplies = await Reply.find({
      'reportedBy.0': { $exists: true },
      isDeleted: false
    });

    res.json({
      discussions: reportedDiscussions,
      replies: reportedReplies
    });
  } catch (error) {
    console.error('Error fetching reported content:', error);
    res.status(500).json({ error: 'Failed to fetch reported content' });
  }
});

export default router; 