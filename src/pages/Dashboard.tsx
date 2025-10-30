import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Target, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface DailyTask {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  task_date: string;
}

interface TaskCompletion {
  id: string;
  task_id: string;
  is_correct: boolean;
  completed_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: taskData, error: taskError } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("task_date", today)
        .single();

      if (taskError && taskError.code !== "PGRST116") {
        throw taskError;
      }

      setTodayTask(taskData);

      const { data: completionsData, error: completionsError } = await supabase
        .from("user_task_completions")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (completionsError) throw completionsError;

      setCompletions(completionsData || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completedCount = completions.filter((c) => c.is_correct).length;
  const totalCount = completions.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Добро пожаловать, {user?.user_metadata?.full_name || "Пользователь"}!
          </h1>
          <p className="text-muted-foreground">Ваш путь к успешному собеседованию</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Выполнено заданий</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                <p className="text-sm text-muted-foreground">Успешность</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Дней активности</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Task */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Задание дня</h2>
              {todayTask ? (
                <>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
                    {todayTask.difficulty === "easy"
                      ? "Легко"
                      : todayTask.difficulty === "medium"
                      ? "Средне"
                      : "Сложно"}
                  </span>
                  <h3 className="text-xl font-semibold mb-2">{todayTask.title}</h3>
                  <p className="text-muted-foreground mb-4">{todayTask.description}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Сегодня нет доступных заданий</p>
              )}
            </div>
          </div>
          {todayTask && (
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate(`/task/${todayTask.id}`)}
            >
              Начать задание
            </Button>
          )}
        </Card>

        {/* Mock Interview Section */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">AI Mock Interview</h2>
              <p className="text-muted-foreground">
                Практикуйтесь с AI-интервьюером в реальном времени
              </p>
            </div>
          </div>
          <Button variant="default" size="lg" onClick={() => navigate("/mock-interview")}>
            Начать интервью
          </Button>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Последняя активность</h2>
          {completions.length > 0 ? (
            <div className="space-y-3">
              {completions.slice(0, 5).map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        completion.is_correct ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    <span className="text-sm">
                      {new Date(completion.completed_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      completion.is_correct ? "text-success" : "text-destructive"
                    }`}
                  >
                    {completion.is_correct ? "Выполнено" : "Не выполнено"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Пока нет активности</p>
          )}
        </Card>
      </div>
    </div>
  );
}
