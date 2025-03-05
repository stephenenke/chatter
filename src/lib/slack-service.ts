import { WebClient } from '@slack/web-api';
import { SlackMessage, SlackChannel, Message } from '@/types';
import { SlackTokenManager } from './slack-token';
import { formatISO, subDays, parseISO } from 'date-fns';

/**
 * Service for interacting with the Slack API
 */
export class SlackService {
  private client: WebClient | null = null;
  
  constructor(token?: string) {
    if (token) {
      this.client = new WebClient(token);
    }
  }
  
  /**
   * Set the Slack API token
   */
  setToken(token: string) {
    this.client = new WebClient(token);
  }
  
  /**
   * Get token from the manager for a specific user
   */
  initializeWithUserId(userId: string) {
    const token = SlackTokenManager.getToken(userId);
    if (token) {
      this.setToken(token);
      return true;
    }
    return false;
  }
  
  /**
   * Check if the service has been initialized with a token
   */
  isInitialized(): boolean {
    return this.client !== null;
  }
  
  /**
   * Fetch channels accessible to the authenticated user
   */
  async getChannels(): Promise<SlackChannel[]> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }
    
    try {
      // Fetch public channels
      const publicResult = await this.client.conversations.list({
        exclude_archived: true,
        limit: 100,
        types: 'public_channel'
      });
      
      // Fetch private channels
      const privateResult = await this.client.conversations.list({
        exclude_archived: true,
        limit: 100,
        types: 'private_channel'
      });
      
      // Combine and format channels
      const publicChannels = publicResult.channels || [];
      const privateChannels = privateResult.channels || [];
      const allChannels = [...publicChannels, ...privateChannels];
      
      return allChannels.map(channel => ({
        id: channel.id || '',
        name: channel.name || '',
        is_private: channel.is_private || false,
        num_members: channel.num_members || 0
      }));
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      throw new Error('Failed to fetch Slack channels');
    }
  }
  
  /**
   * Fetch messages from a channel within a date range
   */
  async getChannelMessages(
    channelId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ messages: Message[], days: string[] }> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }
    
    try {
      // Set default date range if not provided (last 7 days)
      const end = endDate ? parseISO(endDate) : new Date();
      const start = startDate ? parseISO(startDate) : subDays(end, 7);
      
      const endTimestamp = formatISO(end);
      const startTimestamp = formatISO(start);
      
      // Fetch history
      const result = await this.client.conversations.history({
        channel: channelId,
        limit: 100,
        oldest: Math.floor(new Date(startTimestamp).getTime() / 1000).toString(),
        latest: Math.floor(new Date(endTimestamp).getTime() / 1000).toString()
      });
      
      // Process messages
      const slackMessages = result.messages || [];
      
      // Group messages by day
      const messagesByDay: Record<string, Message[]> = {};
      const days: string[] = [];
      
      slackMessages.forEach((msg: any) => {
        if (!msg.text || msg.subtype === 'bot_message') {
          return; // Skip bot messages and empty messages
        }
        
        const timestamp = new Date(Number(msg.ts) * 1000);
        const day = formatISO(timestamp, { representation: 'date' });
        
        if (!messagesByDay[day]) {
          messagesByDay[day] = [];
          days.push(day);
        }
        
        messagesByDay[day].push({
          user: msg.user || 'Unknown',
          text: msg.text,
          timestamp: msg.ts,
          threadTs: msg.thread_ts
        });
      });
      
      // Sort days
      days.sort();
      
      // Flatten messages for response
      const messages = Object.values(messagesByDay).flat();
      
      return { messages, days };
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      throw new Error('Failed to fetch channel messages');
    }
  }
  
  /**
   * Get user profile information
   */
  async getUserInfo(userId: string): Promise<{ name: string; real_name?: string; }> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }
    
    try {
      const result = await this.client.users.info({ user: userId });
      
      if (!result.user) {
        throw new Error('User not found');
      }
      
      return {
        name: result.user.name || 'Unknown',
        real_name: result.user.real_name
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { name: 'Unknown' };
    }
  }
}