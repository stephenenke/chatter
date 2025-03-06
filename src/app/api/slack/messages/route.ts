import { NextRequest } from 'next/server';
import { SlackService } from '@/lib/slack-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const { channelId, startDate, endDate } = await request.json();
    
    if (!channelId) {
      return Response.json({ error: 'Channel ID is required' }, { status: 400 });
    }
    
    // Initialize the Slack service
    const slackService = new SlackService();
    const isInitialized = slackService.initializeWithUserId(userId);
    
    if (!isInitialized) {
      return Response.json({ error: 'Slack not connected' }, { status: 400 });
    }
    
    // Fetch messages
    const { messages, days } = await slackService.getChannelMessages(
      channelId, 
      startDate, 
      endDate
    );
    
    return Response.json({ messages, days });
  } catch (error) {
    console.error('Error fetching Slack messages:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch messages' }, 
      { status: 500 }
    );
  }
}