import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createThread, loadThreads, saveThreads } from "@/lib/threads";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const threads = loadThreads();
    let targetId: string;
    if (threads.length > 0) {
      targetId = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
    } else {
      const t = createThread();
      saveThreads([t]);
      targetId = t.id;
    }
    navigate({ to: "/$threadId", params: { threadId: targetId }, replace: true });
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
      Loading…
    </div>
  );
}
