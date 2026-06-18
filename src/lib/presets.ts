export type Preset = {
  id: string;
  label: string;
  description: string;
  prompt: string;
};

export const PRESETS: Preset[] = [
  {
    id: "email",
    label: "Draft an email",
    description: "Professional emails with the right tone",
    prompt:
      "Help me draft a professional email. Ask me about: purpose, recipient (client / manager / colleague / supplier), tone (formal, informal, persuasive, friendly), and key points to include. Then produce the email in Subject / Dear / Body / Kind regards format.",
  },
  {
    id: "summarize",
    label: "Summarize meeting notes",
    description: "Extract decisions, owners, and deadlines",
    prompt:
      "I'll paste meeting notes. Summarize them with: Summary, Key Discussion Points, Decisions Made, an Action Items table (Task · Owner · Due Date), and Risks/Follow-Ups. Ask me to paste the notes now.",
  },
  {
    id: "plan",
    label: "Plan my day",
    description: "Prioritize tasks and time-block a schedule",
    prompt:
      "Help me plan my workday. Ask for my task list and working hours, then categorize into High/Medium/Low priority, produce a time-blocked schedule table, and add 2-3 productivity recommendations.",
  },
  {
    id: "research",
    label: "Research a topic",
    description: "Summary, insights, opportunities, next steps",
    prompt:
      "Act as my research assistant. Ask what topic, article, or URL I want analyzed, then deliver: Overview, Key Insights, Opportunities, and Recommendations. Flag anything uncertain.",
  },
];
