import { NextRequest } from 'next/server';
import { SlackService } from '@/lib/slack-service';
import { getServerSession } from 'next-auth';
//import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user session
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user?.id) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // For demo purposes, using a mock user ID
    const userId = 'demo-user-id';
    
    // Initialize the Slack service
    const slackService = new SlackService();
    const isInitialized = slackService.initializeWithUserId(userId);
    
    if (!isInitialized) {
      return Response.json({ error: 'Slack not connected' }, { status: 400 });
    }
    
    // Fetch channels
    const channels = await slackService.getChannels();
    
    return Response.json({ channels });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch channels' }, 
      { status: 500 }
    );
  }
}