import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
})

export const CATEGORY_TYPES = ["ASSET", "LIABILITY", "REVENUE", "EXPENSE"] as const
export type CategoryType = (typeof CATEGORY_TYPES)[number]

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(CATEGORY_TYPES, { message: "Type must be ASSET, LIABILITY, REVENUE, or EXPENSE" }),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(CATEGORY_TYPES).optional(),
})

export const createTransactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be greater than 0"),
  fromCategoryId: z.string().min(1, "From category is required"),
  toCategoryId: z.string().min(1, "To category is required"),
  date: z.string().min(1, "Date is required"),
  aiGenerated: z.boolean().optional().default(false),
}).refine(data => data.fromCategoryId !== data.toCategoryId, {
  message: "From and To categories must be different",
})

export const updateTransactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be greater than 0"),
  fromCategoryId: z.string().min(1, "From category is required"),
  toCategoryId: z.string().min(1, "To category is required"),
  date: z.string().min(1, "Date is required"),
}).refine(data => data.fromCategoryId !== data.toCategoryId, {
  message: "From and To categories must be different",
})
