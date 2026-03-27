import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Send, Search, ChevronRight, Clock, MessageSquare, UserCheck } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { students } from "../data/mock-data";
import { useAuth } from "../contexts/auth-context";
import { Faculty } from "../data/mock-data";

// Build mentee thread list from students whose mentorId matches logged-in faculty
const menteeThreads = students
  .filter((s) => s.mentorId === "F001") // In real app: filter by logged-in faculty id
  .map((s) => ({
    id: s.id,
    studentName: s.name,
    subject: "Academic Mentorship",
    lastMessage: s.status === "critical"
      ? "Your attendance is critically low. Please respond urgently."
      : s.status === "warning"
      ? "I noticed your attendance slipping. Let's connect."
      : "Your performance is on track — keep it up!",
    time: "Today",
    unread: s.status !== "safe",
    status: s.status,
  }));

const chatHistories: Record<string, { from: "faculty" | "student"; text: string; time: string }[]> = {
  S001: [
    { from: "faculty", text: "Hi Emily! Great work this semester, your attendance is outstanding.", time: "Mar 20, 9:00 AM" },
    { from: "student", text: "Thank you, Professor! I'm really enjoying the DSA course.", time: "Mar 20, 9:15 AM" },
    { from: "faculty", text: "Keep up the pace. Your CIE 3 scores were excellent.", time: "Mar 21, 10:30 AM" },
  ],
  S002: [
    { from: "faculty", text: "Hi Michael, your attendance in OS has dropped to 76%. Is everything okay?", time: "Mar 22, 2:30 PM" },
    { from: "student", text: "I was unwell last week, Professor. I'm back now and will make up the classes.", time: "Mar 22, 3:15 PM" },
    { from: "faculty", text: "Please submit the medical certificate if you have one. I'll account for those days.", time: "Mar 22, 3:20 PM" },
    { from: "faculty", text: "Also review the CIE 3 notes I shared. Focus on the OS scheduling algorithms.", time: "Today, 10:00 AM" },
  ],
};

export function FacultyMessages() {
  const [searchParams] = useSearchParams();
  const defaultStudent = searchParams.get("studentId");
  const [selectedId, setSelectedId] = useState<string | null>(defaultStudent || (menteeThreads[0]?.id ?? null));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chatHistories);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const faculty = user as Faculty;

  const activeThread = menteeThreads.find((t) => t.id === selectedId);
  const activeMessages = selectedId ? (messages[selectedId] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = () => {
    if (!message.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = `Today, ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), { from: "faculty", text: message.trim(), time: timeStr }],
    }));
    setMessage("");
  };

  return (
    <FacultyLayout activeItem="Messages">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mentee Messages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Communicate directly with your assigned mentees</p>
        </div>

        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ height: "calc(100vh - 240px)", minHeight: "520px" }}
        >
          <div className="flex h-full">
            {/* Sidebar: Thread List */}
            <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${selectedId ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search mentees..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {menteeThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No mentees assigned yet</p>
                  </div>
                ) : (
                  menteeThreads.map((thread, i) => (
                    <motion.button
                      key={thread.id}
                      onClick={() => setSelectedId(thread.id)}
                      className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedId === thread.id ? "bg-indigo-50 dark:bg-indigo-950/20 border-l-2 border-l-indigo-500" : ""}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${thread.status === "critical" ? "bg-gradient-to-br from-rose-500 to-red-500" : thread.status === "warning" ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-violet-500"}`}>
                          {thread.studentName.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{thread.studentName}</span>
                            <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{thread.time}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{thread.lastMessage}</div>
                        </div>
                        {thread.unread && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            {selectedId && activeThread ? (
              <div className={`flex-1 flex flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <button onClick={() => setSelectedId(null)} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight className="w-5 h-5 text-slate-600 rotate-180" />
                  </button>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${activeThread.status === "critical" ? "bg-gradient-to-br from-rose-500 to-red-500" : activeThread.status === "warning" ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-violet-500"}`}>
                    {activeThread.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">{activeThread.studentName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{activeThread.subject}</div>
                  </div>
                  <a
                    href={`/faculty/student/${selectedId}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 transition-colors"
                  >
                    View Profile →
                  </a>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.from === "faculty" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from === "faculty" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md"}`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${msg.from === "faculty" ? "text-indigo-200" : "text-slate-400"}`}>
                          <Clock className="w-3 h-3" />{msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message to your mentee..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSend}
                      className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Select a conversation</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose a mentee to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </FacultyLayout>
  );
}
