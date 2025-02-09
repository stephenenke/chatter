import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const extractTopicsFromMessages = async (messages: string[]) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a topic extraction system with expertise in project management and software development. Extract key discussion topics from Slack messages. Group similar topics together and provide concise labels."
      },
      {
        role: "user",
        content: `Extract the main topics from these messages and return them as a JSON array of strings:\n${messages.join("\n")}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{"topics":[]}').topics;
};