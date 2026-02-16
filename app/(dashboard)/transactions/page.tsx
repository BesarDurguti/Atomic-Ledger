"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, ArrowRight, Trash2, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
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
  fromCategory: Category
  toCategory: Category
  date: string
  aiGenerated: boolean
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const fetchTransactions = useCallback(async () => {
    const res = await fetch("/api/transactions")
    if (res.ok) {
      const data = await res.json()
      setTransactions(data)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories")
    if (res.ok) {
      const data = await res.json()
      setCategories(data)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchCategories()]).then(() => {
      setLoading(false)
    })
  }, [fetchTransactions, fetchCategories])

  const handleSave = async () => {
    if (!description.trim() || !amount || !fromId || !toId || fromId === toId) return
    setSaving(true)

    const payload = {
      description,
      amount: parseFloat(amount),
      fromCategoryId: fromId,
      toCategoryId: toId,
      date,
    }

    if (editingTransaction) {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await fetchTransactions()
        resetForm()
        toast.success("Transaction updated")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update transaction")
      }
    } else {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await fetchTransactions()
        resetForm()
        toast.success("Transaction created")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create transaction")
      }
    }

    setSaving(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDescription(transaction.description)
    setAmount(transaction.amount.toString())
    setFromId(transaction.fromCategoryId)
    setToId(transaction.toCategoryId)
    setDate(new Date(transaction.date).toISOString().split("T")[0])
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchTransactions()
      toast.success("Transaction deleted")
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to delete transaction")
    }
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setFromId("")
    setToId("")
    setDate(new Date().toISOString().split("T")[0])
    setEditingTransaction(null)
    setDialogOpen(false)
  }

  const totalSpent = transactions
    .filter(t => t.toCategory?.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "New Transaction"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Update the transaction details." : "Record a new transaction. Money moves from one category to another."}
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
                      {categories.map(c => (
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
                      {categories.map(c => (
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
                disabled={!description.trim() || !amount || !fromId || !toId || fromId === toId || saving}
              >
                {saving ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving...</>
                ) : (
                  editingTransaction ? "Save Changes" : "Post Transaction"
                )}
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
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(t.date).toLocaleDateString()}
                    </TableCell>
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
                        {t.fromCategory?.name ?? "Unknown"}
                        <ArrowRight className="inline size-3 mx-1 text-muted-foreground" />
                        {t.toCategory?.name ?? "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{t.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(t)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
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
