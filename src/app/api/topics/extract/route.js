import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a topic extraction system. Extract key discussion topics from Slack messages."
        },
        {
          role: "user",
          content: `Extract the main topics from these messages and return them as a JSON array of strings:\n${messages.join("\n")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const topics = JSON.parse(response.choices[0].message.content).topics;
    return Response.json({ topics });
  } catch (error) {
    console.error('Topic extraction error:', error);
    return Response.json({ error: 'Failed to extract topics' }, { status: 500 });
  }
}