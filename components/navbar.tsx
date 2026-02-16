"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"

export function Navbar() {
  return (
    <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center justify-between">
        <div className="lg:hidden flex items-center gap-2 font-semibold">
          <Image src="/icon-no-bg.png" alt="Atomic Ledger" width={28} height={28} />
          <span>Atomic Ledger</span>
        </div>

        <div className="hidden lg:block text-sm text-muted-foreground">
          AI-Powered Double-Entry Bookkeeping
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            BU
          </div>
        </div>
      </div>
    </header>
  )
}
