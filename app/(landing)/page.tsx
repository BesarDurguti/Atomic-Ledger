import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  BookOpen,
  ListTree,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "AI Assistant",
    description:
      "Chat with your finances using natural language. Create transactions, ask questions about your spending, and get insights -- all through conversation.",
    icon: Sparkles,
  },
  {
    title: "Double-Entry Bookkeeping",
    description:
      "Every transaction is automatically balanced with proper debits and credits. Your ledger stays accurate with real accounting principles built in.",
    icon: BookOpen,
  },
  {
    title: "Smart Categories",
    description:
      "Organize your money flow with a flexible chart of accounts. Track assets, liabilities, income, and expenses in a structure that makes sense.",
    icon: ListTree,
  },
  {
    title: "Real-time Insights",
    description:
      "See where your money goes at a glance. Spending breakdowns, transaction history, and ledger validation -- all on your personal dashboard.",
    icon: BarChart3,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/icon-no-bg.png"
              alt="Atomic Ledger"
              width={28}
              height={28}
            />
            <span>Atomic Ledger</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
            AL
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Atomic Ledger
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            AI-Powered Double-Entry Bookkeeping
          </p>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Track your personal finances with the precision of professional
            accounting. Powered by AI so you can manage your money through
            natural conversation -- no spreadsheets required.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need to manage your money
            </h2>
            <p className="mt-2 text-muted-foreground">
              Built on real accounting principles, simplified by AI.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-card">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Get started in under a minute.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create an account",
                description:
                  "Sign up for free and your chart of accounts is set up automatically with sensible defaults.",
              },
              {
                step: "2",
                title: "Add transactions",
                description:
                  "Enter transactions manually or tell the AI assistant what you spent -- it handles the rest.",
              },
              {
                step: "3",
                title: "See insights",
                description:
                  "Your dashboard updates in real time with spending breakdowns and ledger validation.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/icon-no-bg.png"
                alt="Atomic Ledger"
                width={20}
                height={20}
              />
              <span className="text-sm font-medium">Atomic Ledger</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, Tailwind CSS, Prisma, and OpenAI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
