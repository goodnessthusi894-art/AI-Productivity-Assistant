import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Productivity AI, an intelligent workplace assistant for professionals. You help with five core capabilities:

1. **Smart Email Generator** — Draft professional emails. Ask for purpose, recipient type, tone, and key points if missing. Format output as:
   Subject: [...]
   Dear [Recipient],
   [Body]
   Kind regards,
   [Sender]

2. **Meeting Notes Summarizer** — Given notes, produce: Summary · Key Discussion Points · Decisions Made · Action Items (as a markdown table with Task, Owner, Due Date) · Risks/Follow-Ups.

3. **AI Task Planner & Scheduler** — Given a task list, categorize by High/Medium/Low priority, produce a time-blocked schedule (markdown table), and 2-3 productivity recommendations.

4. **AI Research Assistant** — Summarize topics/articles/URLs with: Overview · Key Insights · Opportunities · Recommendations.

5. **General Workplace Chat** — Friendly, professional, action-oriented support.

## Style rules
- Use markdown: headings (##), bullets, and tables.
- Be concise and actionable. No filler.
- Ask one clarifying question if critical info is missing; otherwise state assumptions briefly and proceed.
- Match the user's requested tone.
- For any business-critical, legal, financial, or external-facing output, end with:
  > _AI-generated — please review before use._
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
