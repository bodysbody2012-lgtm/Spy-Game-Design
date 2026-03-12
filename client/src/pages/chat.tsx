import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { NeonButton, GlassCard } from "@/components/ui-components";
import { Send, Mic, MicOff, Trash2, ArrowLeft, Volume2 } from "lucide-react";

const CHAT_ADMIN_KEY = "444444";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("spygame_device_id");
  if (!id) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const prefix = "st-";
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const num = Math.floor(1000 + Math.random() * 9000);
    id = `${prefix}${suffix}${num}`;
    localStorage.setItem("spygame_device_id", id);
  }
  return id;
}

type ChatMessage = {
  id: number;
  senderAlias: string;
  deviceId: string;
  content: string | null;
  type: string;
  filePath: string | null;
  createdAt: string;
};

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const deviceId = useRef(getOrCreateDeviceId());
  const alias = deviceId.current;
  const isAdmin = localStorage.getItem("spygame_chat_admin") === "true";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/chat/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  // Connect WebSocket
  useEffect(() => {
    fetchMessages();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        setMessages(prev => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
      } else if (data.type === "chat_cleared") {
        setMessages([]);
      }
    };

    return () => ws.close();
  }, [fetchMessages]);

  // Send text message
  const sendText = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderAlias: alias, deviceId: deviceId.current, content: inputText }),
      });
      setInputText("");
    } finally {
      setSending(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        form.append("senderAlias", alias);
        form.append("deviceId", deviceId.current);
        setSending(true);
        try {
          await fetch("/api/chat/voice", { method: "POST", body: form });
        } finally {
          setSending(false);
        }
      };
      recorder.start();
      mediaRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("لم يتم السماح بالميكروفون");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setIsRecording(false);
  };

  // Clear chat (admin only)
  const clearChat = async () => {
    if (!confirm("هل تريد مسح كل الرسائل؟")) return;
    await fetch("/api/chat/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: CHAT_ADMIN_KEY }),
    });
  };

  const isMyMessage = (msg: ChatMessage) => msg.deviceId === deviceId.current;

  const formatTime = (str: string) => {
    const d = new Date(str);
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/game/mode")} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-black text-white tracking-tight text-lg">SPY CHAT 💬</h1>
            <p className="text-xs text-gray-500">
              {wsConnected ? <span className="text-green-400">● متصل</span> : <span className="text-red-400">● غير متصل</span>}
              {" · "} أنت: <span className="text-primary font-bold">{alias}</span>
            </p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={clearChat} className="text-red-400 hover:text-red-300 p-2" title="مسح الشات">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ direction: "rtl" }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-20 text-sm">لا توجد رسائل بعد... ابدأ المحادثة!</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${isMyMessage(msg) ? "items-end" : "items-start"}`}
          >
            {!isMyMessage(msg) && (
              <span className="text-xs text-primary font-bold mb-1 px-2">{msg.senderAlias}</span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isMyMessage(msg)
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-white/10 text-gray-100 rounded-tl-sm"
              }`}
            >
              {msg.type === "text" ? (
                <p className="text-base leading-relaxed break-words">{msg.content}</p>
              ) : msg.type === "voice" && msg.filePath ? (
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 shrink-0" />
                  <audio src={msg.filePath} controls className="max-w-[200px] h-8" />
                </div>
              ) : null}
              <p className={`text-xs mt-1 ${isMyMessage(msg) ? "text-white/60" : "text-gray-500"} text-left`} dir="ltr">
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-black/90 backdrop-blur border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          {/* Voice button */}
          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            className={`p-3 rounded-full transition-colors shrink-0 ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            title="اضغط مع الاستمرار للتسجيل"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendText()}
            placeholder="اكتب رسالة... ✍️"
            dir="auto"
            className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
          />

          {/* Send button */}
          <button
            onClick={sendText}
            disabled={!inputText.trim() || sending}
            className="p-3 rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary/80 transition-colors shrink-0"
          >
            <Send className="h-5 w-5" style={{ transform: "scaleX(-1)" }} />
          </button>
        </div>
        {isRecording && (
          <p className="text-center text-red-400 text-xs mt-2 animate-pulse">🔴 جاري التسجيل... ارفع إصبعك للإرسال</p>
        )}
      </div>
    </div>
  );
}
