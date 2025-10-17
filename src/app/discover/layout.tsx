"use client"

import { ModeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import router from "next/router";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <section className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-foreground">chills.</span>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="">
        {children}
      </main>
    </section>
  )
}
