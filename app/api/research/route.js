import OpenAI from "openai";

export const runtime = "nodejs"; // ensure node runtime for fetch flexibility

function getEnv(name) {
  const v = process.env[name];
  return v && v.length ? v : undefined;
}

async function tavilySearch(query) {
  const key = getEnv("TAVILY_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 8,
        include_domains: [],
        exclude_domains: []
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (_) {
    return null;
  }
}

function buildPrompt(userQuery, web) {
  const snippets = web?.results?.map((r, i) => `- (${i+1}) ${r.title} ? ${r.url}\n${r.content?.slice(0, 600) || ""}`).join("\n\n") || "";
  const answer = web?.answer ? `\n\nWeb Summary Suggestion:\n${web.answer}` : "";
  return `You are an expert product strategist and market researcher.
Create a structured, deeply reasoned report for: "${userQuery}".

Deliver:
1) Problem Landscape (top 5 pains, with user quotes-style phrasing)
2) ICP & Personas (demographics, psychographics, jobs-to-be-done)
3) Demand Signals (keywords, communities, search intent, seasonality assumptions)
4) Competitor Scan (direct, indirect, alternatives) with differentiators
5) Pricing Ladders (good/better/best tiers, value metrics)
6) Distribution Channels (SEO, social, partnerships, PLG, affiliates)
7) Risks & Unknowns (assumptions to validate)
8) 90-day Validation Plan (specific experiments, success metrics)
9) 3 MVP Concepts (scope, UX, must-have features)

If web context exists, cite lightweight numeric references like [1], [2].

Web Context:
${snippets}${answer}

Return a crisp, skimmable report with headings and short paragraphs.`;
}

async function* streamFromOpenAI(prompt) {
  const apiKey = getEnv("OPENAI_API_KEY");
  if (!apiKey) {
    yield new TextEncoder().encode("ERROR: OPENAI_API_KEY is not set.\n");
    return;
  }
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an incisive product strategist." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    stream: true,
  });
  const encoder = new TextEncoder();
  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    if (delta) yield encoder.encode(delta);
  }
}

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response("Invalid query", { status: 400 });
    }

    const web = await tavilySearch(query);
    const prompt = buildPrompt(query, web);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamFromOpenAI(prompt)) {
            controller.enqueue(chunk);
          }
        } catch (err) {
          controller.enqueue(new TextEncoder().encode(`\n\n[ERROR] ${err.message}`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response("Bad Request", { status: 400 });
  }
}
