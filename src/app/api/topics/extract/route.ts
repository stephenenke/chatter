import { extractTopicsFromMessages } from '@/lib/topic-extractor';
import { Message } from '@/types';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Validate session (middleware already handles this, but as a backup)
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();
    
    // Validate request
    if (!Array.isArray(messages)) {
      return Response.json({ error: 'Messages must be an array' }, { status: 400 });
    }

    // Convert string messages to Message objects if needed
    const messageObjects: Message[] = messages.map(msg => {
      if (typeof msg === 'string') {
        // For backward compatibility with string messages
        return { user: 'Unknown', text: msg };
      }
      return msg;
    });
    
    const topics = await extractTopicsFromMessages(messageObjects);
    return Response.json({ topics });
  } catch (error) {
    console.error('Topic extraction error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to extract topics' }, 
      { status: 500 }
    );
  }
}