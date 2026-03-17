import { useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  Search,
  ChevronRight,
  Clock,
} from "lucide-react";
import { faculties } from "../data/mock-data";
import { StudentLayout } from "../components/student-layout";

import { useAuth } from "../contexts/auth-context";

const chatMessages = [
  { from: "faculty", text: "Hi John, I noticed your attendance has dropped below 75%. Is everything okay?", time: "Yesterday, 2:30 PM" },
  { from: "student", text: "Thank you for checking in, Professor. I've been unwell last week but I'm recovering now.", time: "Yesterday, 3:15 PM" },
  { from: "faculty", text: "I'm glad to hear you're getting better. Please make sure to attend the upcoming classes to improve your attendance.", time: "Yesterday, 3:20 PM" },
  { from: "faculty", text: "Also, please review the attached notes for the upcoming CIE.", time: "Today, 10:00 AM" },
];

export function StudentMessages() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const student = user as any;
  const mentor = faculties.find(f => f.id === student?.mentorId);

  const mockMessages = mentor ? [
    { id: 1, facultyId: mentor.id, facultyName: mentor.name, subject: "Academic Mentorship", lastMessage: "Also, please review the attached notes for the upcoming CIE.", time: "Today, 10:00 AM", unread: true }
  ] : [];

  const activeChat = mockMessages.find((m) => m.id === selectedChat);

  return (
    <StudentLayout activeItem="Mentor Chat">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mentor Chat</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Directly communicate and seek guidance from your assigned Faculty Mentor</p>
        </div>

        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
        >
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
              {/* Search */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {mockMessages.map((msg, i) => (
                  <motion.button
                    key={msg.id}
                    onClick={() => setSelectedChat(msg.id)}
                    className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedChat === msg.id ? "bg-indigo-50 dark:bg-indigo-950/20" : ""
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {msg.facultyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{msg.facultyName}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">{msg.time}</span>
                        </div>
                        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">{msg.subject}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{msg.lastMessage}</div>
                      </div>
                      {msg.unread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
              <div className={`flex-1 flex flex-col ${selectedChat ? "flex" : "hidden md:flex"}`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-180" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {activeChat?.facultyName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{activeChat?.facultyName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{activeChat?.subject}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                          msg.from === "student"
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          msg.from === "student" ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
                        }`}>
                          <Clock className="w-3 h-3" />
                          {msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg shadow-indigo-500/20 transition-all">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Choose from your conversations to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}

function MessageSquare(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
