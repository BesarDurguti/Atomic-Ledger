"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Check, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  suggestedTransactions?: SuggestedTransaction[]
}

interface SuggestedTransaction {
  description: string
  amount: number
  from: string
  to: string
  accepted?: boolean
}

// Mock AI responses — will be replaced with real API calls
function getMockResponse(input: string): Message {
  const lower = input.toLowerCase()

  if (lower.includes("qira") || lower.includes("rent")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "I found a rent payment in your message. Here's the transaction:",
      suggestedTransactions: [
        { description: "Pagova qiranë", amount: 350, from: "Para ne Banke", to: "Qiraja" },
      ],
    }
  }

  if (lower.includes("rrym") || lower.includes("electric")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Here's the electricity payment:",
      suggestedTransactions: [
        { description: "Pagova rrymën", amount: 45, from: "Para ne Banke", to: "Rryma" },
      ],
    }
  }

  if ((lower.includes("qira") || lower.includes("rent")) && (lower.includes("rrym") || lower.includes("electric"))) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "I found 2 transactions in your message:",
      suggestedTransactions: [
        { description: "Pagova qiranë", amount: 350, from: "Para ne Banke", to: "Qiraja" },
        { description: "Pagova rrymën", amount: 45, from: "Para ne Banke", to: "Rryma" },
      ],
    }
  }

  if (lower.includes("sa") && (lower.includes("shpenzu") || lower.includes("spent"))) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "This month you spent **€1,240** total:\n\n- Qiraja: €350\n- Ushqimi: €320\n- Benzina: €180\n- Rryma: €45\n- Tjera: €345\n\nYour biggest expense is rent at 28% of total spending.",
    }
  }

  if (lower.includes("buxhet") || lower.includes("budget")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Last month you spent **€1,100**. This month you're at **€1,240** (+12.7%).\n\nBiggest increase: **Ushqimi** — €320 vs €210 last month (+52%).\n\nYou might want to keep an eye on food spending.",
    }
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: "I can help you with:\n\n- **Creating transactions** — just describe them naturally (e.g., \"Pagova 350€ qira\")\n- **Spending summaries** — ask \"Sa kam shpenzu kete muaj?\"\n- **Budget analysis** — ask \"A jam mire me buxhet?\"\n\nTry it out!",
  }
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI accounting assistant. You can:\n\n- **Describe a transaction** and I'll create it for you\n- **Ask about spending** and I'll analyze your data\n- **Get budget insights** and comparisons\n\nTry typing something like \"Pagova 350 euro qira\"",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const response = getMockResponse(input)
    setMessages(prev => [...prev, response])
    setIsLoading(false)
  }

  const handleAcceptTransaction = (messageId: string, index: number) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && m.suggestedTransactions) {
          const updated = [...m.suggestedTransactions]
          updated[index] = { ...updated[index], accepted: true }
          return { ...m, suggestedTransactions: updated }
        }
        return m
      })
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Describe transactions naturally or ask about your spending
        </p>
      </div>

      {/* Chat messages */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </div>
                )}

                <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-lg px-4 py-2.5 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {/* Suggested transactions */}
                  {message.suggestedTransactions && (
                    <div className="space-y-2">
                      {message.suggestedTransactions.map((tx, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border p-3 text-left ${
                            tx.accepted ? "border-green-200 bg-green-50" : "bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{tx.description}</span>
                            <span className="text-sm font-bold">€{tx.amount.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {tx.from} → {tx.to}
                          </div>
                          {tx.accepted ? (
                            <Badge className="bg-green-100 text-green-700" variant="secondary">
                              <Check className="size-3 mr-1" />
                              Saved
                            </Badge>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                onClick={() => handleAcceptTransaction(message.id, i)}
                              >
                                <Check className="size-3" />
                                Accept
                              </Button>
                              <Button size="xs" variant="outline">
                                <Pencil className="size-3" />
                                Edit
                              </Button>
                              <Button size="xs" variant="ghost">
                                <X className="size-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a transaction or ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
