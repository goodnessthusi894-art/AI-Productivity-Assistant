import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { createThread, deleteIfEmpty, loadThreads, saveThreads, type Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

// Re-export helper not in threads.ts — inline:
function noop() {}
void noop;
void deleteIfEmpty;

export function ThreadSidebar({ activeId }: { activeId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    const update = () => setThreads(loadThreads().sort((a, b) => b.updatedAt - a.updatedAt));
    update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "productivity-ai:threads:v1") update();
    };
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(update, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, []);

  const handleNew = () => {
    const t = createThread();
    const next = [t, ...loadThreads()];
    saveThreads(next);
    setThreads(next);
    navigate({ to: "/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    const next = loadThreads().filter((t) => t.id !== id);
    saveThreads(next);
    setThreads(next);
    if (id === activeId) {
      if (next.length) {
        navigate({ to: "/$threadId", params: { threadId: next[0].id } });
      } else {
        const t = createThread();
        saveThreads([t]);
        navigate({ to: "/$threadId", params: { threadId: t.id } });
      }
    }
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src={logo} alt="Productivity AI" width={36} height={36} className="rounded-md" />
        <div className="leading-tight">
          <div className="font-display text-base font-semibold">Productivity AI</div>
          <div className="text-xs text-muted-foreground">Workplace assistant</div>
        </div>
      </div>

      <div className="px-3">
        <button
          onClick={handleNew}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </button>
      </div>

      <div className="mt-5 px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Conversations
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {threads.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet
          </div>
        )}
        <ul className="space-y-0.5">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <li key={t.id} className="group relative">
                <Link
                  to="/$threadId"
                  params={{ threadId: t.id }}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  )}
                >
                  <span className="truncate">{t.title || "New conversation"}</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
                  aria-label="Delete conversation"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-background hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <Sparkles className="mb-1 inline h-3 w-3 text-accent" /> AI-generated content — review before
        use for business-critical decisions.
      </div>
    </aside>
  );
}
