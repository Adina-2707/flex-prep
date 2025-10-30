import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, ArrowLeft, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MockInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    initSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const initSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("mock_interview_sessions")
        .insert({
          user_id: user.id,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);

      // Add initial AI message
      const initialMessage: Message = {
        role: "assistant",
        content:
          "Здравствуйте! Я буду вашим AI-интервьюером сегодня. Давайте начнём с простого вопроса: расскажите мне о себе и вашем опыте в программировании.",
      };

      setMessages([initialMessage]);

      await supabase.from("mock_interview_messages").insert({
        session_id: data.id,
        role: "assistant",
        content: initialMessage.content,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Save user message
      await supabase.from("mock_interview_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage.content,
      });

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke("mock-interview-chat", {
        body: { message: userMessage.content, sessionId },
      });

      if (error) throw error;

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message
      await supabase.from("mock_interview_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: aiMessage.content,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось получить ответ от AI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from("mock_interview_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          feedback: "Интервью завершено",
        })
        .eq("id", sessionId);

      toast({
        title: "Интервью завершено",
        description: "Спасибо за участие!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button variant="destructive" onClick={endInterview}>
            Завершить интервью
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">AI Mock Interview</h1>
              <p className="text-sm text-muted-foreground">
                Практикуйтесь в реальном времени
              </p>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Введите ваш ответ..."
              disabled={loading}
              maxLength={1000}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
