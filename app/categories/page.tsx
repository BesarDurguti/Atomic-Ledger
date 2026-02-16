"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react"
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

// Mock data — will be replaced with API calls
const initialCategories: Category[] = [
  { id: "1", name: "Para ne Banke", type: "ASSET" },
  { id: "2", name: "Para Cash", type: "ASSET" },
  { id: "3", name: "Qiraja", type: "EXPENSE" },
  { id: "4", name: "Rryma", type: "EXPENSE" },
  { id: "5", name: "Ushqimi", type: "EXPENSE" },
  { id: "6", name: "Paga", type: "REVENUE" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<CategoryType>("EXPENSE")

  const handleSave = () => {
    if (!name.trim()) return

    if (editingCategory) {
      setCategories(prev =>
        prev.map(c => c.id === editingCategory.id ? { ...c, name, type } : c)
      )
    } else {
      setCategories(prev => [
        ...prev,
        { id: Date.now().toString(), name, type },
      ])
    }

    resetForm()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setType(category.type)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
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
              <Button onClick={handleSave} disabled={!name.trim()}>
                {editingCategory ? "Save Changes" : "Create Category"}
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
