import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async generateDiscussionStarters(topic, context = '') {
    try {
      const prompt = `Generate 5 engaging discussion starters for a classroom setting about "${topic}". 
      ${context ? `Context: ${context}` : ''}
      
      The starters should:
      - Be thought-provoking and open-ended
      - Encourage critical thinking
      - Be appropriate for students
      - Vary in difficulty and approach
      
      Return only the discussion starters, one per line, without numbering.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      });

      const suggestions = completion.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5);

      return suggestions;
    } catch (error) {
      console.error('Error generating discussion starters:', error);
      return [
        'What are your thoughts on this topic?',
        'How does this relate to your personal experience?',
        'What questions do you have about this subject?',
        'Can you think of examples from real life?',
        'What would you do differently in this situation?'
      ];
    }
  }

  static async summarizeDiscussion(discussion, replies) {
    try {
      const content = `
        Discussion: ${discussion.title}
        Prompt: ${discussion.prompt}
        
        Replies:
        ${replies.map(reply => `- ${reply.author.name}: ${reply.content}`).join('\n')}
      `;

      const prompt = `Summarize this classroom discussion in 2-3 sentences. Focus on:
      - Main themes and ideas discussed
      - Key insights from students
      - Overall engagement level
      
      Discussion content:
      ${content}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error summarizing discussion:', error);
      return 'Discussion summary unavailable.';
    }
  }

  static async moderateContent(content, contentType = 'reply') {
    try {
      const prompt = `Analyze this ${contentType} for inappropriate content. Check for:
      - Hate speech or discrimination
      - Profanity or offensive language
      - Spam or irrelevant content
      - Personal attacks or bullying
      
      Content: "${content}"
      
      Respond with only: APPROVED, FLAGGED, or REMOVED`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const result = completion.choices[0].message.content.trim().toUpperCase();
      return ['APPROVED', 'FLAGGED', 'REMOVED'].includes(result) ? result : 'APPROVED';
    } catch (error) {
      console.error('Error moderating content:', error);
      return 'APPROVED'; // Default to approved if AI fails
    }
  }

  static async generateEngagementSuggestions(discussion, replies) {
    try {
      const prompt = `This discussion has ${replies.length} replies. Generate 3 suggestions for teachers to increase engagement:
      
      Discussion: ${discussion.title}
      Current replies: ${replies.length}
      
      Suggestions should be specific and actionable.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating engagement suggestions:', error);
      return [
        'Ask a follow-up question to deepen the conversation',
        'Highlight an interesting point from a student response',
        'Encourage students to respond to each other'
      ];
    }
  }

  static async detectInactiveDiscussions(discussions) {
    try {
      const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const now = new Date();
      
      return discussions.filter(discussion => {
        const timeSinceLastActivity = now - new Date(discussion.lastActivity);
        return timeSinceLastActivity > inactiveThreshold && discussion.replies.length > 0;
      });
    } catch (error) {
      console.error('Error detecting inactive discussions:', error);
      return [];
    }
  }
} 