"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface MessagesPageProps {
  params: Promise<{ id: string }>;
}

interface Conversation {
  id: string;
  traveler_id: string;
  unread_host: number;
  last_message_at: string;
  profiles: { name: string } | null;
}

interface Message {
  id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

export default function MessagesPage({ params }: MessagesPageProps) {
  const supabase = createClient();
  const [hostelId, setHostelId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async (hId: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("*, profiles:traveler_id (name)")
      .eq("hostel_id", hId)
      .eq("status", "active")
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data as unknown as Conversation[]);
  }, [supabase]);

  useEffect(() => {
    params.then(({ id }) => {
      setHostelId(id);
      loadConversations(id);
    });
  }, [params, loadConversations]);

  const loadMessages = async (convId: string) => {
    setSelectedConv(convId);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);

    // Mark as read
    await supabase
      .from("conversations")
      .update({ unread_host: 0 })
      .eq("id", convId);
    loadConversations(hostelId);
  };

  // Realtime subscription
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`host-messages:${selectedConv}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, supabase]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    setSending(true);

    // Get hostel_id from conversation
    const conv = conversations.find((c) => c.id === selectedConv);
    if (!conv) { setSending(false); return; }

    // Optimistic update
    setMessages((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      sender_type: "host",
      content: input.trim(),
      created_at: new Date().toISOString(),
    }]);

    const msg = input.trim();
    setInput("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostel_id: hostelId, content: msg }),
    });

    setSending(false);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/manage/hostels/${hostelId}/edit`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversation List */}
        <Card className="md:col-span-1">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[540px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No messages yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`w-full p-3 text-left border-b hover:bg-muted/50 transition-colors ${
                    selectedConv === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {(conv.profiles as unknown as { name: string })?.name || "Traveler"}
                    </span>
                    {conv.unread_host > 0 && (
                      <Badge className="text-xs">{conv.unread_host}</Badge>
                    )}
                  </div>
                  {conv.last_message_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </p>
                  )}
                </button>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Message View */}
        <Card className="md:col-span-2">
          {selectedConv ? (
            <>
              <ScrollArea className="h-[540px] p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "host" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender_type === "host"
                          ? "bg-primary text-primary-foreground"
                          : msg.sender_type === "system"
                          ? "bg-muted text-muted-foreground italic"
                          : "bg-muted"
                      }`}>
                        {msg.content}
                        <p className="text-[10px] opacity-60 mt-0.5">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Reply to traveler..."
                />
                <Button onClick={handleSend} disabled={sending || !input.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Select a conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
