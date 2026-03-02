import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, ScreenShare, Settings, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

// Mock data
const meetingData = {
    id: "1",
    expertName: "Alex Thompson",
    clientName: "Sarah Chen",
    duration: 60,
    startTime: new Date(),
}

export default function MeetingRoom() {
    // const { id } = useParams()
    const navigate = useNavigate()
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [elapsedTime] = useState("00:00")

    const handleEndCall = () => {
        navigate("/workspace/1")
    }

    return (
        <div className="h-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">WorkflowMatch</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">Consultation Call</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{elapsedTime}</span>
                    <span className="text-slate-400">/ {meetingData.duration} min</span>
                </div>
            </header>

            {/* Main Video Area */}
            <main className="flex-1 flex p-4 gap-4 overflow-hidden">
                {/* Video Grid */}
                <div className={cn("flex-1 grid gap-4", showChat ? "grid-cols-1" : "grid-cols-2")}>
                    {/* Remote Video (Expert) */}
                    <div className="relative bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
                        <div className="text-center">
                            <Avatar fallback={meetingData.expertName} className="w-24 h-24 text-3xl mx-auto mb-4" />
                            <p className="text-white font-medium">{meetingData.expertName}</p>
                            <p className="text-slate-400 text-sm">Expert</p>
                        </div>
                        {/* Status Indicators */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="text-white text-sm">{meetingData.expertName}</span>
                            <span className="flex h-2 w-2 rounded-full bg-green-500" />
                        </div>
                    </div>

                    {/* Local Video (Self) */}
                    <div className={cn(
                        "relative bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center",
                        showChat && "hidden md:flex"
                    )}>
                        {isVideoOn ? (
                            <div className="text-center">
                                <Avatar fallback={meetingData.clientName} className="w-20 h-20 text-2xl mx-auto mb-4" />
                                <p className="text-white font-medium">{meetingData.clientName}</p>
                                <p className="text-slate-400 text-sm">You</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                                    <VideoOff className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-slate-400">Camera Off</p>
                            </div>
                        )}
                        {/* Status */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="text-white text-sm">You</span>
                            {isMuted && <MicOff className="h-4 w-4 text-red-500" />}
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-80 bg-slate-800 rounded-2xl flex flex-col">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="text-white font-medium">Chat</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-center text-slate-500 text-sm py-8">
                                No messages yet
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-700">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Controls */}
            <footer className="px-6 py-6">
                <div className="flex items-center justify-center gap-4">
                    {/* Mute */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                            "h-14 w-14 rounded-full",
                            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                        )}
                    >
                        {isMuted ? (
                            <MicOff className="h-6 w-6 text-white" />
                        ) : (
                            <Mic className="h-6 w-6 text-white" />
                        )}
                    </Button>

                    {/* Video */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={cn(
                            "h-14 w-14 rounded-full",
                            !isVideoOn ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                        )}
                    >
                        {isVideoOn ? (
                            <Video className="h-6 w-6 text-white" />
                        ) : (
                            <VideoOff className="h-6 w-6 text-white" />
                        )}
                    </Button>

                    {/* Screen Share */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className={cn(
                            "h-14 w-14 rounded-full",
                            isScreenSharing ? "bg-primary hover:bg-primary-600" : "bg-slate-700 hover:bg-slate-600"
                        )}
                    >
                        <ScreenShare className="h-6 w-6 text-white" />
                    </Button>

                    {/* Chat */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowChat(!showChat)}
                        className={cn(
                            "h-14 w-14 rounded-full",
                            showChat ? "bg-primary hover:bg-primary-600" : "bg-slate-700 hover:bg-slate-600"
                        )}
                    >
                        <MessageSquare className="h-6 w-6 text-white" />
                    </Button>

                    {/* Settings */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-14 w-14 rounded-full bg-slate-700 hover:bg-slate-600"
                    >
                        <Settings className="h-6 w-6 text-white" />
                    </Button>

                    {/* End Call */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEndCall}
                        className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 ml-4"
                    >
                        <Phone className="h-6 w-6 text-white rotate-[135deg]" />
                    </Button>
                </div>
            </footer>
        </div>
    )
}
