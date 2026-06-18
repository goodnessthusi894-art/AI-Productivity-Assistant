import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat-window";
import { ThreadSidebar } from "@/components/thread-sidebar";

export const Route = createFileRoute("/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation · Productivity AI" },
      { name: "description", content: "Chat with Productivity AI to draft emails, summarize meetings, plan tasks, and research topics." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/$threadId" });
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ThreadSidebar activeId={threadId} />
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Remount on threadId change so messages don't bleed */}
        <ChatWindow key={threadId} threadId={threadId} />
      </main>
    </div>
  );
}
