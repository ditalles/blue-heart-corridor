"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChatWidgetProps {
  hostelId: string;
  hostelName: string;
  isLoggedIn: boolean;
}

interface Message {
  id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

export function ChatWidget({ hostelId, hostelName, isLoggedIn }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load messages
  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;

    async function loadMessages() {
      const res = await fetch(`/api/messages?hostel_id=${hostelId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setConversationId(data.conversation_id);
    }
    loadMessages();
  }, [isOpen, hostelId, isLoggedIn]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    const messageText = input.trim();
    setInput("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_type: "traveler",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel_id: hostelId, content: messageText }),
      });
      const data = await res.json();
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
    } catch {
      // Message already shown optimistically
    }

    setSending(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => window.location.href = `/auth/login?redirect=${window.location.pathname}`}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 sm:w-96 shadow-2xl">
          <CardHeader className="p-3 flex flex-row items-center justify-between border-b">
            <div>
              <CardTitle className="text-sm">{hostelName}</CardTitle>
              <Badge variant="outline" className="text-xs mt-0.5">
                Chat with host
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>Send a message to {hostelName}</p>
                  <p className="text-xs mt-1">They&apos;ll receive it on Viber</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_type === "traveler" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.sender_type === "traveler"
                        ? "bg-primary text-primary-foreground"
                        : msg.sender_type === "system"
                        ? "bg-muted text-muted-foreground italic"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                    <p className="text-[10px] opacity-60 mt-0.5">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-2 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={sending || !input.trim()}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
