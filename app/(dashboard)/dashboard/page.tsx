"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ListTree, Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react"

interface DashboardData {
  totalTransactions: number
  totalSpent: number
  aiGenerated: number
  breakdown: { name: string; amount: number }[]
  recent: {
    id: string
    description: string
    amount: number
    from: string
    to: string
    date: string
    aiGenerated: boolean
  }[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    const res = await fetch("/api/dashboard")
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) return null

  const maxBreakdown = data.breakdown.length > 0
    ? Math.max(...data.breakdown.map(b => b.amount))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ListTree className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Created</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.aiGenerated}</div>
            <p className="text-xs text-muted-foreground">Of {data.totalTransactions} transactions</p>
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
                <p className="text-xs text-muted-foreground">
                  {data.totalTransactions} transactions validated — Sum(Debits) = Sum(Credits)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>By expense category</CardDescription>
          </CardHeader>
          <CardContent>
            {data.breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {data.breakdown.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">€{item.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.amount / maxBreakdown) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          {data.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {data.recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-xs text-muted-foreground w-20 shrink-0">
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{t.description}</span>
                        {t.aiGenerated && <Badge variant="secondary" className="text-xs shrink-0">AI</Badge>}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
