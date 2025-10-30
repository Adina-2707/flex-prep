import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Brain, TrendingUp, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export default function Landing() {
  const benefits = [
    {
      icon: <CheckCircle className="h-8 w-8 text-success" />,
      title: "Короткие ежедневные задания",
      description: "Решайте по одному заданию каждый день для постоянного прогресса",
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI Mock-Interview",
      description: "Практикуйтесь с искусственным интеллектом в режиме реального собеседования",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-secondary" />,
      title: "Отслеживание прогресса",
      description: "Следите за своими достижениями и улучшайте навыки",
    },
  ];

  const testimonials = [
    {
      name: "Алексей М.",
      role: "Frontend Developer",
      text: "Благодаря InterviewPrep я получил работу в крупной IT-компании. Ежедневные задания помогли систематизировать знания.",
    },
    {
      name: "Мария К.",
      role: "Software Engineer",
      text: "AI mock-интервью - это невероятно! Ощущение реального собеседования помогло мне справиться с волнением.",
    },
    {
      name: "Дмитрий П.",
      role: "Backend Developer",
      text: "Система отслеживания прогресса мотивирует заниматься каждый день. Результаты заметны уже через неделю.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background -z-10" />
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Подготовьтесь к собеседованию{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  с AI
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Ежедневные задания и реалистичные mock-интервью помогут вам успешно пройти техническое собеседование
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Начать подготовку
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Узнать больше
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img
                src={heroImage}
                alt="Подготовка к собеседованию"
                className="rounded-2xl shadow-strong w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Почему выбирают InterviewPrep?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Отзывы пользователей</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MessageSquare className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Готовы начать?</h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к тысячам разработчиков, которые уже улучшают свои навыки
          </p>
          <Link to="/auth">
            <Button
              variant="secondary"
              size="xl"
              className="shadow-xl hover:shadow-2xl"
            >
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
