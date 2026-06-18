import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Mail, ClipboardList, CalendarClock, BookOpen } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PRESETS } from "@/lib/presets";
import { deriveTitle, loadThreads, saveThreads } from "@/lib/threads";
import logo from "@/assets/logo.png";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  summarize: ClipboardList,
  plan: CalendarClock,
  research: BookOpen,
};

export function ChatWindow({ threadId }: { threadId: string }) {
  const initial = useMemo<UIMessage[]>(() => {
    const t = loadThreads().find((x) => x.id === threadId);
    return t?.messages ?? [];
  }, [threadId]);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });

  // Persist messages whenever they change.
  useEffect(() => {
    if (messages.length === 0) return;
    const threads = loadThreads();
    const idx = threads.findIndex((t) => t.id === threadId);
    const title = deriveTitle(messages) ?? "New conversation";
    const updated = { id: threadId, title, updatedAt: Date.now(), messages };
    if (idx >= 0) threads[idx] = updated;
    else threads.unshift(updated);
    saveThreads(threads);
  }, [messages, threadId]);

  // Keep focus on the textarea.
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <img
                  src={logo}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-xl"
                />
              }
              title="How can I help you work smarter today?"
              description="Draft emails, summarize meetings, plan your day, or research a topic. Pick a starting point — or just ask."
            >
              <div className="mt-5 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {PRESETS.map((p) => {
                  const Icon = PRESET_ICONS[p.id] ?? Mail;
                  return (
                    <button
                      key={p.id}
                      onClick={() => submit(p.prompt)}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/30 text-accent-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {p.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {p.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </ConversationEmptyState>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                if (m.role === "user") {
                  return (
                    <Message key={m.id} from="user">
                      <MessageContent className="bg-primary text-primary-foreground">
                        <div className="whitespace-pre-wrap text-sm">{text}</div>
                      </MessageContent>
                    </Message>
                  );
                }
                return (
                  <Message key={m.id} from="assistant">
                    <MessageContent className="bg-transparent p-0">
                      <div className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:tracking-tight prose-p:leading-relaxed prose-table:text-sm prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown>{text || ""}</ReactMarkdown>
                      </div>
                    </MessageContent>
                  </Message>
                );
              })}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent className="bg-transparent p-0">
                    <Shimmer>Thinking…</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/70 px-4 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(_msg, event) => {
              event.preventDefault();
              void submit(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              placeholder="Ask Productivity AI…"
              onChange={(e) => setInput(e.target.value)}
            />
            <PromptInputFooter className="justify-between">
              <span className="text-[11px] text-muted-foreground">
                AI-generated · review before use
              </span>
              <PromptInputSubmit
                status={isBusy ? "streaming" : undefined}
                disabled={!isBusy && !input.trim()}
                onClick={(e) => {
                  if (isBusy) {
                    e.preventDefault();
                    stop();
                  }
                }}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
