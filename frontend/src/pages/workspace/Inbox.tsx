import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, MoreVertical, Paperclip, Search, Send, X } from "lucide-react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { WorkspaceMessage, WorkspaceThread } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppPageHeader, EmptyState, StatStrip } from "@/components/layout/PagePrimitives";
import { formatRelativeTime } from "@/lib/utils";

const buildAttachmentFromUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(normalizedUrl);
    const segment = parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;
    return {
      name: segment.slice(0, 180),
      url: normalizedUrl.slice(0, 2000),
    };
  } catch {
    return null;
  }
};

const threadContextVariant = (thread: WorkspaceThread) => {
  if (thread.applicationId) return "success" as const;
  if (thread.invitationId) return "warning" as const;
  return "outline" as const;
};

const threadContextLabel = (thread: WorkspaceThread) => {
  if (thread.applicationId) return "Application context";
  if (thread.invitationId) return "Invitation context";
  return "Job context";
};

const jobStatusVariant = (status?: string) => {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "warning" as const;
  return "outline" as const;
};

export default function Inbox() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<WorkspaceThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ name: string; url: string }>>([]);
  const [threadSearch, setThreadSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [showThreadTools, setShowThreadTools] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  usePageMeta({
    title: "Inbox | n8nExperts",
    description: "Job-scoped chat with application and invitation context for active workspace conversations.",
    canonicalPath: "/inbox",
    noIndex: true,
  });

  const selectedThread = useMemo(() => threads.find((thread) => thread._id === selectedThreadId) || null, [threads, selectedThreadId]);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setError("");
    try {
      const response = await chatApi.getThreads({ limit: 50, ...(threadSearch.trim() && { q: threadSearch.trim() }) });
      setThreads(response.data.threads);
      if (!selectedThreadId && response.data.threads.length > 0) {
        setSelectedThreadId(response.data.threads[0]._id);
      }
      if (selectedThreadId && response.data.threads.every((thread) => thread._id !== selectedThreadId)) {
        setSelectedThreadId(response.data.threads[0]?._id || null);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load inbox.");
    } finally {
      setLoadingThreads(false);
    }
  }, [selectedThreadId, threadSearch]);

  const loadMessages = useCallback(
    async (threadId: string) => {
      setLoadingMessages(true);
      setError("");
      try {
        const response = await chatApi.getThreadMessages(threadId, { limit: 100, ...(messageSearch.trim() && { q: messageSearch.trim() }) });
        setMessages(response.data.messages);
        await chatApi.markThreadRead(threadId);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(apiError.response?.data?.message || "Failed to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [messageSearch]
  );

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedThreadId);
  }, [loadMessages, selectedThreadId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadThreads();
      if (selectedThreadId) {
        loadMessages(selectedThreadId);
      }
    }, 12000);
    return () => window.clearInterval(id);
  }, [loadMessages, loadThreads, selectedThreadId]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadThreads();
    }, 180);
    return () => window.clearTimeout(id);
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const id = window.setTimeout(() => {
      loadMessages(selectedThreadId);
    }, 180);
    return () => window.clearTimeout(id);
  }, [loadMessages, selectedThreadId]);

  useEffect(() => {
    setPendingAttachments([]);
    setAttachmentUrl("");
    setMessageSearch("");
    setShowThreadTools(false);
  }, [selectedThreadId]);

  const sendMessage = async () => {
    const trimmedBody = messageText.trim();
    if (!selectedThreadId || (!trimmedBody && pendingAttachments.length === 0)) return;
    setSending(true);
    setError("");
    try {
      const response = await chatApi.sendMessage(selectedThreadId, {
        ...(trimmedBody && { body: trimmedBody }),
        ...(pendingAttachments.length > 0 && { attachments: pendingAttachments }),
      });
      setMessages((prev) => [...prev, response.data]);
      setMessageText("");
      setPendingAttachments([]);
      setAttachmentUrl("");
      await loadThreads();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const getPeer = (thread: WorkspaceThread) => {
    const client = typeof thread.clientId === "string" ? null : thread.clientId;
    const expert = typeof thread.expertId === "string" ? null : thread.expertId;
    return user?.role === "expert" ? client : expert;
  };

  const unreadCountForThread = (thread: WorkspaceThread) => {
    if (!user) return 0;
    return user.role === "expert" ? thread.unreadByExpert : thread.unreadByClient;
  };

  const addAttachment = () => {
    const parsed = buildAttachmentFromUrl(attachmentUrl);
    if (!parsed) {
      setError("Enter a valid attachment URL.");
      return;
    }
    if (pendingAttachments.some((item) => item.url === parsed.url)) {
      setError("Attachment already added.");
      return;
    }
    if (pendingAttachments.length >= 5) {
      setError("Maximum 5 attachments per message.");
      return;
    }
    setPendingAttachments((prev) => [...prev, parsed]);
    setAttachmentUrl("");
    setError("");
  };

  const removeAttachment = (url: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.url !== url));
  };

  const selectedJob = selectedThread && typeof selectedThread.jobId !== "string" ? selectedThread.jobId : null;
  const unreadTotal = threads.reduce((sum, thread) => sum + unreadCountForThread(thread), 0);

  return (
    <div className="container py-8">
      <AppPageHeader
        eyebrow="Workspace inbox"
        title="Inbox"
        description="Job-scoped chat with clearer application or invitation context so each thread tells you what work it belongs to."
      >
        <StatStrip
          items={[
            { label: "Threads", value: threads.length },
            { label: "Unread", value: unreadTotal, hint: "Unread count from your side of each thread." },
            { label: "Selected", value: selectedThread ? threadContextLabel(selectedThread) : "None" },
          ]}
        />
      </AppPageHeader>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mt-6">{error}</div>}

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 mt-6">
        <aside className="panel p-4 space-y-2 h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input className="pl-10" value={threadSearch} onChange={(event) => setThreadSearch(event.target.value)} placeholder="Search threads" />
          </div>
          {loadingThreads && <p className="text-sm text-slate-300">Loading threads...</p>}
          {!loadingThreads && threads.length === 0 && (
            <EmptyState
              title="No threads yet."
              description="Threads appear after an invitation or application creates a real job-scoped conversation."
              className="py-8"
            />
          )}
          {threads.map((thread) => {
            const peer = getPeer(thread);
            const job = typeof thread.jobId === "string" ? null : thread.jobId;
            const unread = unreadCountForThread(thread);

            return (
              <button
                key={thread._id}
                onClick={() => setSelectedThreadId(thread._id)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                  selectedThreadId === thread._id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={peer?.img} fallback={peer?.username || "U"} className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-semibold text-white">{peer?.username || "Participant"}</p>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{job?.title || "Job thread"}</p>
                    </div>
                  </div>
                  {unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">{unread}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={threadContextVariant(thread)}>{threadContextLabel(thread)}</Badge>
                  {job?.status && <Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>}
                  <Badge variant="outline">{formatRelativeTime(thread.updatedAt)}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-300 line-clamp-2">{thread.lastMessage || "No messages yet."}</p>
              </button>
            );
          })}
        </aside>

        <section className="panel p-4 flex flex-col h-[calc(100vh-16rem)]">
          {!selectedThread && (
            <EmptyState
              title="Select a thread to start chatting."
              description="Once you pick a thread, the header will show the related job, current context, and next route back into the workspace."
              className="py-12"
            />
          )}
          {selectedThread && (
            <>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {(() => {
                          const peer = getPeer(selectedThread);
                          return peer?.username || "Thread";
                        })()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={threadContextVariant(selectedThread)}>{threadContextLabel(selectedThread)}</Badge>
                        {selectedJob?.status && <Badge variant={jobStatusVariant(selectedJob.status)}>{selectedJob.status}</Badge>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-slate-300">
                      <p className="inline-flex items-center gap-2 font-semibold text-white">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {selectedJob?.title || "Job"}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {selectedThread.applicationId
                          ? "This thread is attached to an application, so proposal context already exists in the workspace."
                          : selectedThread.invitationId
                            ? "This thread was opened from an invitation context."
                            : "This thread is tied to a specific job even if the application metadata is light."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        {selectedJob?._id && (
                          <Link
                            to={user?.role === "expert" ? `/jobs?jobId=${selectedJob._id}` : `/my-jobs?jobId=${selectedJob._id}`}
                            className="text-sky-300 hover:underline"
                          >
                            Open job
                          </Link>
                        )}
                        <Link to={user?.role === "expert" ? "/my-applications" : "/my-jobs"} className="text-sky-300 hover:underline">
                          Open {user?.role === "expert" ? "my applications" : "my jobs"}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Button size="sm" variant="outline" onClick={() => setShowThreadTools((prev) => !prev)}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {showThreadTools && (
                      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-white/10 bg-[var(--color-bg-elevated)] p-3 shadow-xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thread tools</p>
                        <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            className="pl-10"
                            value={messageSearch}
                            onChange={(event) => setMessageSearch(event.target.value)}
                            placeholder="Search messages"
                          />
                        </div>
                        {messageSearch && (
                          <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setMessageSearch("")}>
                            Clear message search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingMessages && <p className="text-sm text-slate-300">Loading messages...</p>}
                {!loadingMessages && messages.length === 0 && (
                  <EmptyState
                    title="No messages yet."
                    description="Send the first reply when you are ready to move the job conversation forward."
                    className="py-10"
                  />
                )}
                {messages.map((message) => {
                  const sender = typeof message.senderId === "string" ? null : message.senderId;
                  const mine = (typeof message.senderId === "string" ? message.senderId : message.senderId._id) === user?._id;
                  return (
                    <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-xl px-3 py-2 ${mine ? "bg-primary text-white" : "bg-white/10 text-slate-200"}`}>
                        {message.body && <p className="text-[13px] whitespace-pre-wrap">{message.body}</p>}
                        {(message.attachments || []).length > 0 && (
                          <div className={`${message.body ? "mt-2" : ""} space-y-1`}>
                            {message.attachments?.map((attachment) => (
                              <a
                                key={`${message._id}-${attachment.url}`}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs underline ${
                                  mine ? "text-white/90 hover:text-white" : "text-sky-300 hover:text-sky-200"
                                }`}
                              >
                                <Paperclip className="h-3 w-3" />
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/75" : "text-slate-400"}`}>
                          {sender?.username || "User"} | {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={attachmentUrl}
                  onChange={(event) => setAttachmentUrl(event.target.value)}
                  placeholder="Attachment URL (optional)"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAttachment();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addAttachment}>
                  <Paperclip className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {pendingAttachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingAttachments.map((attachment) => (
                    <span
                      key={attachment.url}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200"
                    >
                      {attachment.name}
                      <button
                        type="button"
                        aria-label={`Remove ${attachment.name}`}
                        onClick={() => removeAttachment(attachment.url)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Type a message"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  aria-label="Send message"
                  onClick={sendMessage}
                  disabled={sending || (!messageText.trim() && pendingAttachments.length === 0)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
