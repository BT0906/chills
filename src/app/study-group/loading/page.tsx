"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoadingPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      router.push("/squad/success")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Finding the best time for your squad...</h2>
        <p className="text-muted-foreground">Sending invitations to members</p>
      </div>
    </div>
  )
}
