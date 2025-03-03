import OpenAI from 'openai';
import { Message, TopicData, TopicAnalysisResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extracts discussion topics from an array of messages
 */
export const extractTopicsFromMessages = async (messages: Message[]): Promise<string[]> => {
  try {
    const messageTexts = messages.map(msg => `${msg.user}: ${msg.text}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a topic extraction system with expertise in project management and software development. Extract key discussion topics from Slack messages. Group similar topics together and provide concise labels."
        },
        {
          role: "user",
          content: `Extract the main topics from these messages and return them as a JSON array of strings:\n${messageTexts.join("\n")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return [];
    
    return JSON.parse(content).topics;
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw new Error('Failed to extract topics from messages');
  }
};

/**
 * Generates a summary for messages related to a specific topic
 */
export const summarizeTopicMessages = async (topic: string, messages: Message[]): Promise<string> => {
  try {
    const messageTexts = messages.map(msg => `${msg.user}: ${msg.text}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in summarizing technical discussions. Create clear, concise summaries that capture the key points and decisions."
        },
        {
          role: "user",
          content: `Summarize the following conversation about "${topic}":\n${messageTexts.join("\n")}`
        }
      ]
    });

    return response.choices[0].message.content || 'No summary available';
  } catch (error) {
    console.error('Error summarizing topic:', error);
    throw new Error('Failed to summarize topic messages');
  }
};

/**
 * Analyzes messages to generate suggested tickets based on discussion patterns
 */
export const suggestTicketsFromMessages = async (
  topic: string, 
  messages: Message[]
): Promise<{ suggestion: string; reason: string }> => {
  try {
    const messageTexts = messages.map(msg => `${msg.user}: ${msg.text}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in project management. Analyze conversations and identify potential tickets that should be created to track work items, bugs, or features."
        },
        {
          role: "user",
          content: `Review this conversation about "${topic}" and suggest a ticket that should be created. Return your response as a JSON object with "suggestion" (ticket title) and "reason" (why this ticket should be created) fields:\n${messageTexts.join("\n")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { suggestion: '', reason: '' };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error suggesting tickets:', error);
    throw new Error('Failed to suggest tickets from messages');
  }
};

/**
 * Analyze message volume and generate topic data for heatmap
 */
export const analyzeMessageVolume = (
  topics: string[], 
  messagesByDay: Record<string, Message[][]>
): TopicAnalysisResult => {
  // Initialize result structure
  const days = Object.keys(messagesByDay).sort();
  const values: number[][] = [];
  const trends: number[][] = [];
  
  // Calculate values and trends for each topic
  topics.forEach((topic, topicIdx) => {
    const topicValues: number[] = [];
    const topicTrends: number[] = [];
    
    days.forEach((day, dayIdx) => {
      // Calculate message volume for this topic on this day
      const dayMessages = messagesByDay[day];
      const topicMentions = dayMessages.reduce((count, hourMessages) => {
        return count + hourMessages.filter(msg => 
          msg.text.toLowerCase().includes(topic.toLowerCase())
        ).length;
      }, 0);
      
      // Convert to percentage (0-100) based on total messages
      const totalMessages = dayMessages.reduce((count, hourMessages) => count + hourMessages.length, 0);
      const value = totalMessages > 0 ? (topicMentions / totalMessages) * 100 : 0;
      topicValues.push(Math.round(value));
      
      // Calculate trend (day-over-day change)
      if (dayIdx > 0) {
        const trend = topicValues[dayIdx] - topicValues[dayIdx - 1];
        topicTrends.push(trend);
      } else {
        topicTrends.push(0); // No trend for first day
      }
    });
    
    values.push(topicValues);
    trends.push(topicTrends);
  });
  
  return {
    topics,
    days,
    values,
    trends
  };
};