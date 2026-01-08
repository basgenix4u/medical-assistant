// src/app/(dashboard)/chat/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What helps with headaches naturally?",
  "How can I improve my sleep?",
  "What are good remedies for cold?",
  "How to boost immune system?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>AI Health Assistant</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
            Ask me anything about symptoms and natural remedies
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {messages.length === 0 ? (
            // Empty State
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "var(--accent)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Bot size={32} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
                How can I help you today?
              </h3>
              <p
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "14px",
                  maxWidth: "400px",
                  marginBottom: "24px",
                }}
              >
                Ask me about symptoms, natural remedies, or general health questions.
              </p>

              {/* Suggestions */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "20px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Lightbulb size={14} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      gap: "12px",
                      flexDirection: message.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        background:
                          message.role === "user" ? "var(--primary)" : "var(--accent)",
                      }}
                    >
                      {message.role === "user" ? (
                        <User size={18} color="white" />
                      ) : (
                        <Bot size={18} style={{ color: "var(--primary)" }} />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "14px 18px",
                        borderRadius: "16px",
                        borderBottomLeftRadius: message.role === "user" ? "16px" : "4px",
                        borderBottomRightRadius: message.role === "user" ? "4px" : "16px",
                        background:
                          message.role === "user" ? "var(--primary)" : "var(--bg-secondary)",
                        color: message.role === "user" ? "white" : "var(--text-secondary)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {message.content}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          marginTop: "8px",
                          opacity: 0.7,
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot size={18} style={{ color: "var(--primary)" }} />
                  </div>
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "var(--bg-secondary)",
                      borderRadius: "16px",
                      borderBottomLeftRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span className="typing-dot" style={{ animationDelay: "0s" }} />
                      <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-tertiary)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health question..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "14px 18px",
                fontSize: "15px",
                border: "1px solid var(--border-light)",
                borderRadius: "12px",
                background: "var(--bg-secondary)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: input.trim() ? "var(--primary)" : "var(--border-light)",
                color: input.trim() ? "white" : "var(--text-muted)",
                border: "none",
                borderRadius: "12px",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "center",
              marginTop: "12px",
            }}
          >
            MedAssist AI provides general information only. Always consult a doctor for medical advice.
          </p>
        </form>
      </div>

      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: typing-bounce 1.4s infinite ease-in-out;
        }
        
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}