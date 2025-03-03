import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { messages, channelName, dateRange } = await request.json();
    
    // Validate request
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const formattedMessages = messages.map(msg => 
      typeof msg === 'string' ? msg : `${msg.user}: ${msg.text}`
    ).join("\n");
    
    const channelContext = channelName ? ` in the ${channelName} channel` : '';
    const dateContext = dateRange ? ` from ${dateRange}` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in summarizing technical discussions from Slack. Create clear, concise summaries that capture the key points, decisions, and action items. Format your summary with sections for: Overview, Key Points, Decisions, and Action Items."
        },
        {
          role: "user",
          content: `Summarize the following Slack conversation${channelContext}${dateContext}:\n\n${formattedMessages}`
        }
      ]
    });

    const summary = response.choices[0].message.content || 'No summary available';
    
    return Response.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize messages' }, 
      { status: 500 }
    );
  }
}