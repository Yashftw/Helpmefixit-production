import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getConnectionMessages, sendMessage, Message } from "@/lib/api";

const GigConnection = () => {
    const { connectionId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return navigate("/");

            setUserId(session.user.id);
            try {
                const msgs = await getConnectionMessages(session.access_token, connectionId!);
                setMessages(msgs || []);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        initData();

        // The Magic: Subscribe to Supabase Realtime WebSocket changes
        const channel = supabase.channel(`messages-${connectionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `connection_id=eq.${connectionId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [connectionId, navigate]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 150);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connectionId) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const currentMsg = newMessage.trim();
            setNewMessage(""); // Clear early for snappy UI response
            await sendMessage(session.access_token, connectionId, currentMsg);
            scrollToBottom();
        } catch (err) {
            console.error("Message error:", err);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Dynamic Background Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/20 blur-[120px]" />
            </div>

            {/* Styled Header */}
            <header className="p-4 glass-surface flex items-center shadow-card gap-4 z-10 sticky top-0 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary/80 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-lg text-foreground">Active Gig Connection</h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-2 ring-green-500/20" /> Connected
                    </p>
                </div>
            </header>

            {/* Chat Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10" ref={scrollRef}>
                {messages.map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-card ${isMe
                                        ? "gradient-primary text-primary-foreground rounded-br-sm"
                                        : "bg-secondary/40 border border-white/5 backdrop-blur-md rounded-bl-sm"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message Input Frame */}
            <div className="p-4 z-10 bg-background/60 backdrop-blur-xl border-t border-white/5 border-t-white/[0.08] relative mb-2">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write your message..."
                        className="flex-1 bg-secondary/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all duration-300"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3.5 rounded-2xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-40 hover:scale-[1.05] transition-all duration-300 flex items-center justify-center shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GigConnection;