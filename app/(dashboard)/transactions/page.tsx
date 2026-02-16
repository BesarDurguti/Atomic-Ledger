"use client"

import { useState } from "react"
import { Plus, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Category {
  id: string
  name: string
  type: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  fromCategoryId: string
  toCategoryId: string
  date: string
  aiGenerated: boolean
}

// Mock data — will be replaced with API calls
const mockCategories: Category[] = [
  { id: "1", name: "Para ne Banke", type: "ASSET" },
  { id: "2", name: "Para Cash", type: "ASSET" },
  { id: "3", name: "Qiraja", type: "EXPENSE" },
  { id: "4", name: "Rryma", type: "EXPENSE" },
  { id: "5", name: "Ushqimi", type: "EXPENSE" },
  { id: "6", name: "Paga", type: "REVENUE" },
]

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Pagova qiranë per shkurt",
    amount: 350,
    fromCategoryId: "1",
    toCategoryId: "3",
    date: "2026-02-01",
    aiGenerated: false,
  },
  {
    id: "2",
    description: "Bleva ushqim ne market",
    amount: 45.50,
    fromCategoryId: "2",
    toCategoryId: "5",
    date: "2026-02-03",
    aiGenerated: false,
  },
  {
    id: "3",
    description: "Mora pagën per janar",
    amount: 1200,
    fromCategoryId: "6",
    toCategoryId: "1",
    date: "2026-02-05",
    aiGenerated: true,
  },
  {
    id: "4",
    description: "Pagova rrymën",
    amount: 42,
    fromCategoryId: "1",
    toCategoryId: "4",
    date: "2026-02-10",
    aiGenerated: true,
  },
]

function getCategoryName(id: string) {
  return mockCategories.find(c => c.id === id)?.name ?? "Unknown"
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSave = () => {
    if (!description.trim() || !amount || !fromId || !toId || fromId === toId) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      fromCategoryId: fromId,
      toCategoryId: toId,
      date,
      aiGenerated: false,
    }

    setTransactions(prev => [newTransaction, ...prev])
    resetForm()
  }

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setFromId("")
    setToId("")
    setDate(new Date().toISOString().split("T")[0])
    setDialogOpen(false)
  }

  const totalSpent = transactions
    .filter(t => {
      const toCat = mockCategories.find(c => c.id === t.toCategoryId)
      return toCat?.type === "EXPENSE"
    })
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Record and view all your transactions
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
              <DialogDescription>
                Record a new transaction. Money moves from one category to another.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Pagova qiranë per shkurt"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={fromId} onValueChange={setFromId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ArrowRight className="size-4 text-muted-foreground mb-2.5" />

                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromId && toId && fromId === toId && (
                <p className="text-sm text-destructive">From and To cannot be the same category</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={!description.trim() || !amount || !fromId || !toId || fromId === toId}
              >
                Post Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.filter(t => t.aiGenerated).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>From → To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No transactions yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground text-sm">{t.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{t.description}</span>
                        {t.aiGenerated && (
                          <Badge variant="secondary" className="text-xs">AI</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getCategoryName(t.fromCategoryId)}
                        <ArrowRight className="inline size-3 mx-1 text-muted-foreground" />
                        {getCategoryName(t.toCategoryId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{t.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
