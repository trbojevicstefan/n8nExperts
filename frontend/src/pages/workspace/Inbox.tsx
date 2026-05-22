import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Paperclip, Search, Send, X, Video } from "lucide-react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { WorkspaceMessage, WorkspaceThread } from "@/types";
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

const threadContextLabel = (thread: WorkspaceThread) => {
  if (thread.applicationId) return "Application context";
  if (thread.invitationId) return "Invitation context";
  return "Job context";
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
    title: "Messages | n8nExperts",
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

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden border-t border-slate-200 bg-white lg:flex-row">
      {/* Left Sidebar: Conversations List */}
      <aside className="z-10 flex w-full shrink-0 flex-col border-r border-slate-200 bg-slate-50/70 lg:w-80 xl:w-[360px]">
        <div className="space-y-4 border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Messages</h1>
            <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
              <span className="material-symbols-outlined font-light">edit_square</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              aria-label="Search threads"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/60 focus:ring-1 focus:ring-primary/25"
              placeholder="Search conversations..."
              value={threadSearch}
              onChange={(event) => setThreadSearch(event.target.value)}
            />
          </div>
        </div>

        {/* List of Chats */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingThreads && <p className="text-sm text-slate-400 p-4 text-center">Loading threads...</p>}
          {!loadingThreads && threads.length === 0 && (
             <div className="p-8 text-center">
               <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">forum</span>
               <p className="text-sm font-semibold text-slate-900">No messages yet</p>
               <p className="text-xs text-slate-500 mt-1">Threads appear after an invitation or application.</p>
             </div>
          )}
          {threads.map((thread) => {
            const peer = getPeer(thread);
            const job = typeof thread.jobId === "string" ? null : thread.jobId;
            const unread = unreadCountForThread(thread);
            const isSelected = selectedThreadId === thread._id;

            return (
              <div
                key={thread._id}
                onClick={() => setSelectedThreadId(thread._id)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors border-l-4 ${
                  isSelected 
                    ? "bg-primary/10 border-primary" 
                    : "border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="aspect-square bg-cover bg-center rounded-full size-12"
                    style={{
                      backgroundImage: peer?.img ? `url('${peer.img}')` : undefined,
                      backgroundColor: !peer?.img ? (isSelected ? "rgba(244, 37, 89, 0.15)" : "#e2e8f0") : undefined,
                    }}
                  >
                     {!peer?.img && (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                          {peer?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                     )}
                  </div>
                  <div className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white ${
                    unread > 0 ? "bg-green-500" : "bg-slate-500"
                  }`}></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold text-sm truncate ${isSelected ? "text-primary" : "text-slate-900"}`}>
                      {peer?.username || "Participant"}
                    </h3>
                    <span className={`text-[11px] font-semibold ${unread > 0 ? "text-primary" : "text-slate-400"}`}>
                      {formatRelativeTime(thread.updatedAt)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${unread > 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                    {job?.title ? `Re: ${job.title}` : thread.lastMessage || "No messages yet."}
                  </p>
                </div>

                {unread > 0 && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-primary text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center">
                      {unread}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Window */}
      <section className="relative flex min-h-0 flex-1 flex-col bg-white">
        {!selectedThread ? (
          <div className="flex flex-1 flex-col items-center justify-center border-l border-slate-200 p-8 text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-slate-100">
               <span className="material-symbols-outlined text-4xl text-slate-500">mark_email_unread</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Your Messages</h2>
            <p className="text-sm text-slate-400 max-w-sm">
              Select a thread to start chatting. The header will show the related job and context.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="aspect-square bg-cover bg-center rounded-full size-10"
                    style={{
                      backgroundImage: getPeer(selectedThread)?.img ? `url('${getPeer(selectedThread)?.img}')` : undefined,
                      backgroundColor: !getPeer(selectedThread)?.img ? "#e2e8f0" : undefined,
                    }}
                  >
                     {!getPeer(selectedThread)?.img && (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-sm">
                          {getPeer(selectedThread)?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                     )}
                  </div>
                  <div className="absolute bottom-0 right-0 size-2.5 rounded-full border border-white bg-green-500"></div>
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    {getPeer(selectedThread)?.username || "Participant"}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                       {threadContextLabel(selectedThread)}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-green-500 font-medium">Online</span>
                    {selectedJob && (
                      <>
                        <span className="text-slate-600 text-[10px]">•</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={selectedJob.title}>
                          {selectedJob.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {selectedJob && (
                  <Link
                    to={user?.role === "expert" ? `/jobs?jobId=${selectedJob._id}` : `/my-jobs?jobId=${selectedJob._id}`}
                    className="text-primary text-xs font-bold hover:underline hidden sm:block"
                  >
                    View Job Context
                  </Link>
                )}
                <div className="hidden h-6 w-[1px] bg-slate-200 sm:block"></div>
                <button className="text-slate-500 hover:text-primary transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowThreadTools(!showThreadTools)}
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {showThreadTools && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Search Thread</p>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          placeholder="Search messages..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Message Area Thread */}
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col space-y-6 overflow-y-auto bg-slate-50/70 p-6">
              
              {loadingMessages && <p className="text-sm text-slate-400 text-center">Loading messages...</p>}
              {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 p-2 text-xs text-center">{error}</div>}

              {messages.map((message, i) => {
                const mine = (typeof message.senderId === "string" ? message.senderId : message.senderId._id) === user?._id;
                const senderPeer = mine ? null : getPeer(selectedThread);
                
                // Show date separator if first message or if day changed
                const showDate = i === 0 || new Date(messages[i-1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {new Date(message.createdAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </div>
                    )}
                    
                    <div className={`mb-6 flex w-full ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[80%] gap-3 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                        {!mine && (
                          <div
                            className="mb-4 aspect-square size-8 shrink-0 self-end rounded-full bg-cover bg-center bg-no-repeat"
                            style={{
                              backgroundImage: senderPeer?.img ? `url('${senderPeer.img}')` : undefined,
                              backgroundColor: !senderPeer?.img ? "#e2e8f0" : undefined,
                            }}
                          >
                             {!senderPeer?.img && (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-600">
                                  {senderPeer?.username?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                             )}
                          </div>
                        )}
                        
                        <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
                        {message.body && (
                          <div className={`
                            px-4 py-3 text-sm shadow-sm
                            ${mine 
                              ? "rounded-2xl rounded-br-none bg-primary text-white shadow-lg shadow-primary/20"
                              : "rounded-2xl rounded-bl-none border border-slate-200 bg-white text-slate-800"}
                          `}>
                            {message.body}
                          </div>
                        )}
                        
                        {(message.attachments || []).length > 0 && (
                          <div className="flex flex-col gap-1">
                            {message.attachments?.map(att => (
                              <a
                                key={att.url}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`
                                  flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                                  ${mine 
                                    ? "rounded-br-none border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "rounded-bl-none border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"}
                                `}
                              >
                                <Paperclip className="h-3 w-3 opacity-70" />
                                <span className="truncate max-w-[200px]">{att.name}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-0.5">
                          {mine && <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>}
                          <span className="text-[10px] text-slate-500">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <footer className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                {/* Pending attachments preview */}
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pendingAttachments.map(att => (
                      <div key={att.url} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 py-1 pl-3 pr-1 text-xs text-slate-700">
                        <Paperclip className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <button 
                          onClick={() => removeAttachment(att.url)}
                          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Attachment URL Input (hidden by default, triggered by paperclip) */}
                <div className="mb-3 flex gap-2">
                  <div className="flex max-w-sm flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-primary/50">
                    <input
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Paste attachment link & press Enter..."
                      className="flex-1 border-none bg-transparent px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && attachmentUrl) {
                          e.preventDefault();
                          addAttachment();
                        }
                      }}
                    />
                    <button 
                      onClick={addAttachment}
                      disabled={!attachmentUrl}
                      className="bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex flex-1 items-end rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:ring-2 focus-within:ring-primary/30">
                    <label className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Add attachment link above">
                      <Paperclip className="h-5 w-5" />
                    </label>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="custom-scrollbar max-h-32 min-h-[40px] flex-1 resize-none border-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                      placeholder="Type a message..."
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    aria-label="Send message"
                    onClick={sendMessage}
                    disabled={sending || (!messageText.trim() && pendingAttachments.length === 0)}
                    className="size-[52px] rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                  >
                    {sending ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                </div>
                
                <div className="mt-2 flex items-center justify-between px-2">
                  <p className="text-[10px] text-slate-500">Press Enter to send, Shift + Enter for new line</p>
                </div>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
