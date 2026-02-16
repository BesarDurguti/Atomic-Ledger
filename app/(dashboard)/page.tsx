import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ListTree, Sparkles, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react"

// Mock data — will be replaced with API calls
const recentTransactions = [
  { id: "1", description: "Pagova qiranë per shkurt", amount: 350, from: "Para ne Banke", to: "Qiraja", date: "2026-02-01", ai: false },
  { id: "2", description: "Bleva ushqim ne market", amount: 45.50, from: "Para Cash", to: "Ushqimi", date: "2026-02-03", ai: false },
  { id: "3", description: "Mora pagën per janar", amount: 1200, from: "Paga", to: "Para ne Banke", date: "2026-02-05", ai: true },
  { id: "4", description: "Pagova rrymën", amount: 42, from: "Para ne Banke", to: "Rryma", date: "2026-02-10", ai: true },
  { id: "5", description: "Benzina per jave", amount: 35, from: "Para Cash", to: "Benzina", date: "2026-02-12", ai: false },
]

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ListTree className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€1,240.00</div>
            <p className="text-xs text-muted-foreground">+12.7% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Created</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">Of 24 transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Flagged this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger status + spending breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ledger Status</CardTitle>
            <CardDescription>Double-entry validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">All entries balanced</p>
                <p className="text-xs text-muted-foreground">24 transactions validated — Sum(Debits) = Sum(Credits)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Qiraja", amount: 350, pct: 28 },
                { name: "Ushqimi", amount: 320, pct: 26 },
                { name: "Benzina", amount: 180, pct: 15 },
                { name: "Tjera", amount: 390, pct: 31 },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">€{item.amount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 5 entries</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xs text-muted-foreground w-20 shrink-0">{t.date}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{t.description}</span>
                      {t.ai && <Badge variant="secondary" className="text-xs shrink-0">AI</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.from} <ArrowRight className="inline size-3 mx-0.5" /> {t.to}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium ml-4 shrink-0">€{t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
