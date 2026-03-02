import { useState } from "react"
import { Search, Send, Paperclip, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

// Mock data
const conversations = [
    {
        id: "1",
        name: "Alex Thompson",
        lastMessage: "I've completed the initial setup. Moving on to the workflow...",
        time: "2h ago",
        unread: 2,
        online: true,
    },
    {
        id: "2",
        name: "Maria Garcia",
        lastMessage: "Thanks for the quick fix! The workflow is working perfectly now.",
        time: "5h ago",
        unread: 0,
        online: false,
    },
    {
        id: "3",
        name: "James Wilson",
        lastMessage: "Let me know when you're available for a quick call.",
        time: "1d ago",
        unread: 0,
        online: true,
    },
]

const messagesData = [
    {
        id: "1",
        senderId: "other",
        content: "Hi! I've started working on your n8n automation project. I have a few questions about the API integrations.",
        time: "10:30 AM",
    },
    {
        id: "2",
        senderId: "me",
        content: "Hi Alex! Sure, what would you like to know?",
        time: "10:32 AM",
    },
    {
        id: "3",
        senderId: "other",
        content: "Could you share the API documentation for your CRM? I want to make sure I'm using the correct endpoints.",
        time: "10:35 AM",
    },
    {
        id: "4",
        senderId: "me",
        content: "Of course! Here's the link to our API docs: https://api.example.com/docs. Let me know if you need the API keys.",
        time: "10:40 AM",
    },
    {
        id: "5",
        senderId: "other",
        content: "Perfect, thanks! I'll review them and get back to you. I've completed the initial setup and moving on to the workflow development phase.",
        time: "2:15 PM",
    },
]

export default function Messages() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0])
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const handleSend = () => {
        if (newMessage.trim()) {
            // Handle send message
            setNewMessage("")
        }
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex h-[calc(100vh-10rem)] rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* Sidebar - Conversation List */}
                <div className="w-80 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search conversations..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => setSelectedConversation(conversation)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors",
                                    selectedConversation.id === conversation.id && "bg-slate-100"
                                )}
                            >
                                <div className="relative">
                                    <Avatar fallback={conversation.name} />
                                    {conversation.online && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-900 truncate">{conversation.name}</span>
                                        <span className="text-xs text-slate-400">{conversation.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate mt-1">{conversation.lastMessage}</p>
                                </div>
                                {conversation.unread > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                                        {conversation.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar fallback={selectedConversation.name} />
                                {selectedConversation.online && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{selectedConversation.name}</p>
                                <p className="text-xs text-slate-500">
                                    {selectedConversation.online ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messagesData.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex",
                                    message.senderId === "me" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[70%] rounded-2xl px-4 py-2",
                                        message.senderId === "me"
                                            ? "bg-primary text-white rounded-br-none"
                                            : "bg-slate-100 text-slate-900 rounded-bl-none"
                                    )}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p
                                        className={cn(
                                            "text-[10px] mt-1",
                                            message.senderId === "me" ? "text-primary-100" : "text-slate-400"
                                        )}
                                    >
                                        {message.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1"
                            />
                            <Button size="icon" onClick={handleSend}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
