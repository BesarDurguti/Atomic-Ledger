"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, Landmark, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

type CategoryType = "ASSET" | "EXPENSE" | "REVENUE" | "LIABILITY"

interface Category {
  id: string
  name: string
  type: CategoryType
}

const typeConfig: Record<CategoryType, { label: string; color: string; icon: React.ElementType }> = {
  ASSET: { label: "Asset", color: "bg-blue-100 text-blue-700", icon: Wallet },
  EXPENSE: { label: "Expense", color: "bg-red-100 text-red-700", icon: TrendingDown },
  REVENUE: { label: "Revenue", color: "bg-green-100 text-green-700", icon: TrendingUp },
  LIABILITY: { label: "Liability", color: "bg-orange-100 text-orange-700", icon: Landmark },
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<CategoryType>("EXPENSE")

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories")
    if (res.ok) {
      const data = await res.json()
      setCategories(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)

    if (editingCategory) {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      })
      if (res.ok) {
        await fetchCategories()
        resetForm()
        toast.success("Category updated")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update category")
      }
    } else {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      })
      if (res.ok) {
        await fetchCategories()
        resetForm()
        toast.success("Category created")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create category")
      }
    }

    setSaving(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setType(category.type)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchCategories()
      toast.success("Category deleted")
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to delete category")
    }
  }

  const resetForm = () => {
    setName("")
    setType("EXPENSE")
    setEditingCategory(null)
    setDialogOpen(false)
  }

  const grouped = categories.reduce<Record<CategoryType, Category[]>>(
    (acc, cat) => {
      acc[cat.type].push(cat)
      return acc
    },
    { ASSET: [], LIABILITY: [], REVENUE: [], EXPENSE: [] }
  )

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
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your spending and income categories
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the category details." : "Create a new category for your transactions."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Qiraja, Ushqimi, Paga..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset — Where money is stored (bank, cash)</SelectItem>
                    <SelectItem value="EXPENSE">Expense — Where money goes (rent, food)</SelectItem>
                    <SelectItem value="REVENUE">Revenue — Where money comes from (salary)</SelectItem>
                    <SelectItem value="LIABILITY">Liability — Money you owe (loans, debt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={!name.trim() || saving}>
                {saving ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving...</>
                ) : (
                  editingCategory ? "Save Changes" : "Create Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category groups */}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(grouped) as [CategoryType, Category[]][]).map(([groupType, items]) => {
          const config = typeConfig[groupType]
          const Icon = config.icon

          return (
            <Card key={groupType}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">{config.label}s</CardTitle>
                  <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                </div>
                <CardDescription>
                  {groupType === "ASSET" && "Where your money is stored"}
                  {groupType === "EXPENSE" && "Where your money goes"}
                  {groupType === "REVENUE" && "Where your money comes from"}
                  {groupType === "LIABILITY" && "Money you owe"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No categories yet</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={config.color} variant="secondary">
                            {config.label}
                          </Badge>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEdit(cat)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
