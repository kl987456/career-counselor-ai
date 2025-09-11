"use client";
import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/server/utils/trpc";
import { AiFillDelete } from "react-icons/ai";
import { BsSun, BsMoon } from "react-icons/bs";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import type { ChatSession, Message } from "@/server/routers/chat";

// Emojis for fun
const USER_EMOJI = "🙋‍♂️";
const AI_EMOJI = "🤖";
const ERROR_EMOJI = "⚠️";

const ChatSessions: React.FC = () => {
  const utils = trpc.useUtils();

  const { data: sessions } = trpc.chat.getSessions.useQuery();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  const { data: messages } = trpc.chat.getMessages.useQuery(
    { sessionId: selectedSessionId || "" },
    { enabled: !!selectedSessionId }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => utils.chat.getMessages.invalidate({ sessionId: selectedSessionId! }),
  });
  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: () => utils.chat.getSessions.invalidate(),
  });
  const deleteSession = trpc.chat.deleteSession.useMutation({
    onSuccess: () => utils.chat.getSessions.invalidate(),
  });
  const deleteMessage = trpc.chat.deleteMessage.useMutation({
    onSuccess: () => utils.chat.getMessages.invalidate({ sessionId: selectedSessionId! }),
  });

  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => scrollToBottom(), [messages]);

  // Periodic refresh for AI messages
  useEffect(() => {
    if (!selectedSessionId) return;
    const interval = setInterval(() => {
      utils.chat.getMessages.invalidate({ sessionId: selectedSessionId });
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedSessionId, utils]);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;
    try {
      const session = await createSession.mutateAsync({ title: newSessionTitle });
      setSelectedSessionId(session.id);
      setNewSessionTitle("");
      toast.success("Session created ✅");
    } catch {
      toast.error("Failed to create session ❌");
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!selectedSessionId || !input.trim()) return;

    setAiTyping(true);
    try {
      await sendMessage.mutateAsync({ sessionId: selectedSessionId, message: input, sender: "USER" });
      scrollToBottom();

      // Poll until AI responds
      const checkAi = setInterval(async () => {
        const latest = await utils.chat.getMessages.fetch({ sessionId: selectedSessionId });
        const lastMsg = latest?.[latest.length - 1];
        if (lastMsg?.sender === "AI") {
          setAiTyping(false);
          clearInterval(checkAi);
          scrollToBottom();
        }
      }, 1000);
    } catch {
      setAiTyping(false);
      toast.error("Failed to send message ❌");
    }
  };

  const containerBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black";
  const sidebarBg = darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200";
  const messagesBg = darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200";
  const inputBg = darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300";

  return (
    <div className={`h-screen p-6 flex gap-6 transition-colors duration-500 ${containerBg}`}>
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-6 z-50 p-2 rounded-full shadow-lg bg-white hover:scale-110 transition"
      >
        {darkMode ? <BsSun className="text-yellow-400" /> : <BsMoon className="text-gray-800" />}
      </button>

      {/* Sidebar */}
      <div className={`transition-all duration-300 rounded-2xl shadow-2xl p-5 flex flex-col border ${sidebarBg} ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <div className="flex justify-between items-center mb-5">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold text-center bg-blue-500 text-white p-3 rounded-lg shadow-md">
              Career Counselor
            </h2>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 hover:bg-gray-200 rounded-full transition-all">
            {sidebarCollapsed ? "➤" : "◀"}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="flex flex-col gap-2 mb-5">
            <input
              type="text"
              placeholder="New chat title"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
              className={`p-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${inputBg}`}
            />
            <button
              onClick={handleCreateSession}
              className="bg-green-500 text-white px-3 py-2 rounded-xl font-semibold shadow hover:scale-105 transform transition-all text-sm"
            >
              + New
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3">
          {sessions?.map((s: ChatSession) => (
            <div
              key={s.id}
              className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all transform hover:scale-[1.02] ${
                selectedSessionId === s.id
                  ? "bg-blue-400 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
              onClick={() => setSelectedSessionId(s.id)}
            >
              <div>
                <div className="font-semibold">{sidebarCollapsed ? s.title[0] : s.title}</div>
                {!sidebarCollapsed && <div className="text-xs opacity-70">{new Date(s.createdAt).toLocaleString()}</div>}
              </div>
              {!sidebarCollapsed && (
                <AiFillDelete
                  className="text-red-500 cursor-pointer hover:text-red-700 hover:scale-125 transition-transform"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteSession.mutateAsync({ sessionId: s.id });
                    if (s.id === selectedSessionId) setSelectedSessionId(null);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Messages Panel */}
      <div className={`flex-1 flex flex-col rounded-2xl shadow-2xl p-6 border transition-colors duration-500 ${messagesBg}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold bg-blue-500 text-white p-3 rounded-lg shadow-md">Career Counseling Chat</h2>
          {selectedSessionId && <span className="text-sm opacity-70">🟢 Online</span>}
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3 relative">
          {!selectedSessionId ? (
            <div className="text-gray-400 text-center italic">Select a session to see messages</div>
          ) : (
            <ul className="flex flex-col space-y-3">
              {messages?.map((m: Message) => {
                const emoji = m.sender === "USER" ? USER_EMOJI : m.content.includes("error") ? ERROR_EMOJI : AI_EMOJI;
                return (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative z-10 p-3 rounded-2xl shadow-md max-w-[70%] group ${
                      m.sender === "USER"
                        ? "bg-blue-400 text-white self-end"
                        : darkMode
                        ? "bg-gray-700 text-white self-start"
                        : "bg-gray-200 text-black self-start"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold">
                        {emoji}
                      </div>
                      <div>
                        <p>
                          <strong>{m.sender === "USER" ? "You" : "AI"}:</strong> {m.content}
                        </p>
                        <div className="flex gap-2 mt-2 text-lg">
                          <span className="cursor-pointer hover:scale-125 transition">👍</span>
                          <span className="cursor-pointer hover:scale-125 transition">😂</span>
                          <span className="cursor-pointer hover:scale-125 transition">❤️</span>
                        </div>
                        <div className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <AiFillDelete
                      className="absolute -top-2 -right-2 text-red-500 cursor-pointer hover:text-red-700 hover:scale-125 transition-transform opacity-0 group-hover:opacity-100"
                      onClick={async () => {
                        await deleteMessage.mutateAsync({ messageId: m.id });
                      }}
                    />
                  </motion.li>
                );
              })}

              {aiTyping && (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    darkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
                  }`}
                >
                  <motion.span className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                  <motion.span className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.span className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  <span className="ml-2 text-sm opacity-70 italic">AI is typing...</span>
                </motion.li>
              )}

              <div ref={messageEndRef} />
            </ul>
          )}
        </div>

        {selectedSessionId && (
          <form
            className="flex gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const inputEl = e.currentTarget.elements.namedItem("msg") as HTMLTextAreaElement;
              await handleSendMessage(inputEl.value);
              inputEl.value = "";
            }}
          >
            <textarea
              name="msg"
              placeholder="Type your message..."
              className={`flex-1 p-3 rounded-xl resize-none shadow-inner focus:ring-2 focus:ring-blue-500 transition-all ${inputBg}`}
              rows={1}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const inputEl = e.currentTarget as HTMLTextAreaElement;
                  await handleSendMessage(inputEl.value);
                  inputEl.value = "";
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow hover:scale-105 transform transition-all"
            >
              Send 🚀
            </button>
          </form>
        )}
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default ChatSessions;
