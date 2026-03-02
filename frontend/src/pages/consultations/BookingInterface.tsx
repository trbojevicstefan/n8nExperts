import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, Video, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"

// Mock data
const expertData = {
    name: "Alex Thompson",
    title: "Senior n8n Automation Expert",
    hourlyRate: 75,
    avatar: null,
}

const availableSlots = {
    "2024-01-20": ["09:00", "10:00", "14:00", "15:00"],
    "2024-01-21": ["10:00", "11:00", "13:00", "16:00"],
    "2024-01-22": ["09:00", "11:00", "14:00"],
    "2024-01-23": ["10:00", "13:00", "15:00", "16:00"],
    "2024-01-24": ["09:00", "10:00", "11:00"],
}

const durations = [
    { value: 30, label: "30 min", price: null },
    { value: 60, label: "1 hour", price: 75 },
    { value: 120, label: "2 hours", price: 150 },
]

export default function BookingInterface() {
    // const { expertId } = useParams()
    const navigate = useNavigate()
    const [selectedDuration, setSelectedDuration] = useState(60)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date("2024-01-20"))

    // Generate week dates
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart)
        date.setDate(date.getDate() + i)
        return date.toISOString().split("T")[0]
    })

    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { weekday: "short" })
    }

    const getDayNumber = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.getDate()
    }

    const hasSlots = (dateStr: string) => {
        return availableSlots[dateStr as keyof typeof availableSlots]?.length > 0
    }

    const getPrice = () => {
        const duration = durations.find((d) => d.value === selectedDuration)
        return duration?.price || (expertData.hourlyRate * selectedDuration) / 60
    }

    const handleBook = () => {
        // Navigate to payment or confirmation
        navigate("/workspace/1")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Expert Info */}
                <Card className="mb-6">
                    <CardContent className="p-6 flex items-center gap-4">
                        <Avatar fallback={expertData.name} className="w-16 h-16 text-xl" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{expertData.name}</h1>
                            <p className="text-slate-600">{expertData.title}</p>
                            <p className="text-primary font-semibold mt-1">${expertData.hourlyRate}/hour</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left - Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Select Date & Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Duration Selection */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Duration</label>
                                <div className="flex gap-2">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => setSelectedDuration(d.value)}
                                            className={cn(
                                                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                                selectedDuration === d.value
                                                    ? "bg-primary text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Week Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newDate = new Date(currentWeekStart)
                                        newDate.setDate(newDate.getDate() - 7)
                                        setCurrentWeekStart(newDate)
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium text-slate-700">
                                    {currentWeekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newDate = new Date(currentWeekStart)
                                        newDate.setDate(newDate.getDate() + 7)
                                        setCurrentWeekStart(newDate)
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Day Grid */}
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {weekDates.map((dateStr) => (
                                    <button
                                        key={dateStr}
                                        disabled={!hasSlots(dateStr)}
                                        onClick={() => {
                                            setSelectedDate(dateStr)
                                            setSelectedTime(null)
                                        }}
                                        className={cn(
                                            "flex flex-col items-center py-2 rounded-lg transition-colors",
                                            selectedDate === dateStr
                                                ? "bg-primary text-white"
                                                : hasSlots(dateStr)
                                                    ? "bg-slate-100 hover:bg-slate-200"
                                                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="text-xs">{getDayName(dateStr)}</span>
                                        <span className="text-lg font-semibold">{getDayNumber(dateStr)}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Available Times</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableSlots[selectedDate as keyof typeof availableSlots]?.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                                    selectedTime === time
                                                        ? "bg-primary text-white"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right - Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {selectedDate && selectedTime ? (
                                <>
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-slate-500" />
                                            <span className="font-medium">
                                                {new Date(selectedDate).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-slate-500" />
                                            <span className="font-medium">{selectedTime} ({selectedDuration} min)</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Video className="h-5 w-5 text-slate-500" />
                                            <span className="font-medium">Video Call</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Consultation ({selectedDuration} min)</span>
                                            <span className="font-semibold">${getPrice()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Platform Fee</span>
                                            <span className="text-slate-500">$0</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span className="text-primary">${getPrice()}</span>
                                        </div>
                                    </div>

                                    <Button size="lg" className="w-full" onClick={handleBook}>
                                        <Video className="h-4 w-4 mr-2" />
                                        Book Consultation
                                    </Button>

                                    <p className="text-xs text-center text-slate-500">
                                        You'll receive a calendar invite and meeting link after booking
                                    </p>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                    <p>Select a date and time to see booking summary</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
