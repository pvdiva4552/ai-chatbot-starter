import { initialMessage } from "@/lib/data";
import { streamText, Message, generateId } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const buildGoogleGenAIPrompt = (messages: Message[]): Message[] => {
  return [
    {
      id: generateId(),
      role: "user",
      content: initialMessage.content,
    },
    ...messages.map((message) => ({
      id: message.id || generateId(),
      role: message.role,
      content: message.content,
    })),
  ];
};

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await streamText({
    model: google("gemini-2.0-flash"),
    messages: buildGoogleGenAIPrompt(messages),
    temperature: 0.7,
  });

  return stream?.toDataStreamResponse();
}
