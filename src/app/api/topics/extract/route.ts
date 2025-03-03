import { extractTopicsFromMessages, summarizeTopicMessages, suggestTicketsFromMessages } from '@/lib/topic-extractor';
import { Message } from '@/types';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, topic } = await request.json();
    
    // Validate request
    if (!Array.isArray(messages)) {
      return Response.json({ error: 'Messages must be an array' }, { status: 400 });
    }
    
    // Determine which analysis to perform based on the presence of 'topic'
    if (topic) {
      // If a topic is provided, summarize messages for that topic
      const summary = await summarizeTopicMessages(topic, messages);
      
      // Generate ticket suggestion
      const ticketSuggestion = await suggestTicketsFromMessages(topic, messages);
      
      return Response.json({ 
        summary,
        suggestion: ticketSuggestion.suggestion,
        reason: ticketSuggestion.reason
      });
    } else {
      // If no topic is provided, extract topics from messages
      const topics = await extractTopicsFromMessages(messages);
      return Response.json({ topics });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}