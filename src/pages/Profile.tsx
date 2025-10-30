import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Award, Target, Calendar } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  full_name: string;
  email: string;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  mockInterviews: number;
  successRate: number;
}

export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "" });
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    mockInterviews: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchProfile();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email,
        });
      }
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

  const fetchStats = async () => {
    try {
      const { data: completionsData } = await supabase
        .from("user_task_completions")
        .select("*");

      const { data: interviewsData } = await supabase
        .from("mock_interview_sessions")
        .select("*");

      const totalTasks = completionsData?.length || 0;
      const completedTasks = completionsData?.filter((c) => c.is_correct).length || 0;
      const mockInterviews = interviewsData?.length || 0;
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      setStats({
        totalTasks,
        completedTasks,
        mockInterviews,
        successRate: Math.round(successRate),
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Профиль обновлён",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Профиль</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Profile Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Личная информация</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Полное имя</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="Иван Иванов"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Статистика</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-success" />
                  <span className="font-medium">Выполнено заданий</span>
                </div>
                <span className="text-2xl font-bold text-success">
                  {stats.completedTasks}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Всего заданий</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats.totalTasks}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-secondary" />
                  <span className="font-medium">Mock-интервью</span>
                </div>
                <span className="text-2xl font-bold text-secondary">
                  {stats.mockInterviews}
                </span>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Успешность</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Действия</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="default" onClick={() => navigate("/dashboard")}>
              Вернуться к дашборду
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              На главную
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
