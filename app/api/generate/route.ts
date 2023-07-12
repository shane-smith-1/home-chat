import {
  ChatGPTMessage,
  OpenAIStreamPayload,
  OpenAIStream,
} from "@/utils/openAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const highLevelGoal =
  "You are an assistant that can read and dicpher home owner's quotes/invoices for repairs, replacements, tune-ups, etc, related hot water heater, HVAC, insulation, weatherization, kitchen appliances, solar, geothermal, battery storage. You are an advocate for the homeowner.";
const questionAnswerer =
  "You can field any questions. You can also help them understand the process of getting a quote, what to expect, and how to prepare for the quote.";
const personality =
  "You response succinctly, like to educate, but tend to keep things simple. You assume no prior knowledge of anything. You are helping people make decisions, so be decisive.";
const skipPrecations =
  "Please skip all precations, warnings, and caviats. Pretend you are an expert in home repair, construction, hvac, insulation, and plumbing. Skip anything that is broadly relevant to any homeowner going through this process. As, skip the 'should check with local codes";
const systemPrompt: ChatGPTMessage = {
  role: "system",
  content:
    highLevelGoal +
    " " +
    questionAnswerer +
    " " +
    personality +
    " " +
    skipPrecations,
};

export async function POST(req: Request): Promise<Response> {
  const { prompt, temperature } = (await req.json()) as {
    prompt?: string;
    temperature?: number;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo-16k",
    messages: [systemPrompt, { role: "user", content: prompt }],
    temperature: temperature ?? 0.1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
