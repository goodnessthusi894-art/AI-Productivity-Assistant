import { createFileRoute, redirect } from "@tanstack/react-router";
import { createThread, loadThreads, saveThreads } from "@/lib/threads";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const threads = loadThreads();
    if (threads.length > 0) {
      const newest = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      throw redirect({ to: "/$threadId", params: { threadId: newest.id } });
    }
    const t = createThread();
    saveThreads([t]);
    throw redirect({ to: "/$threadId", params: { threadId: t.id } });
  },
  component: () => null,
});
