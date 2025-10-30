import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  correct_answer: string;
}

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchTask();
  }, [taskId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите ответ",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      // Simple check - in real app, this would be more sophisticated
      const isCorrect = answer.toLowerCase().includes("function") || 
                       answer.toLowerCase().includes("reverse") ||
                       answer.length > 20;

      const { error } = await supabase
        .from("user_task_completions")
        .upsert({
          user_id: user.id,
          task_id: taskId,
          user_answer: answer,
          is_correct: isCorrect,
        });

      if (error) throw error;

      setResult(isCorrect ? "correct" : "incorrect");
      toast({
        title: isCorrect ? "Отлично!" : "Попробуйте ещё раз",
        description: isCorrect
          ? "Ваш ответ правильный!"
          : "Подумайте над решением ещё раз",
        variant: isCorrect ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к дашборду
        </Button>

        <Card className="p-8">
          <div className="mb-6">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full mb-4 ${
                task.difficulty === "easy"
                  ? "bg-success/10 text-success"
                  : task.difficulty === "medium"
                  ? "bg-secondary/10 text-secondary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {task.difficulty === "easy"
                ? "Легко"
                : task.difficulty === "medium"
                ? "Средне"
                : "Сложно"}
            </span>
            <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
            <p className="text-muted-foreground text-lg">{task.description}</p>
          </div>

          {result === null ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Ваш ответ</label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Напишите ваше решение здесь..."
                  className="min-h-[200px]"
                  maxLength={2000}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Проверить ответ"
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              {result === "correct" ? (
                <>
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-success mb-2">
                    Правильно!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Отличная работа! Вы успешно решили задание.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-destructive mb-2">
                    Не совсем правильно
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Попробуйте подумать над решением ещё раз.
                  </p>
                </>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/dashboard")}>
                  Вернуться к дашборду
                </Button>
                {result === "incorrect" && (
                  <Button variant="outline" onClick={() => setResult(null)}>
                    Попробовать снова
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
