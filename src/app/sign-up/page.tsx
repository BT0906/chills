import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BorderBeam } from "../../components/ui/border-beam"
import { SignUpForm } from '@/components/sign-up-form'


export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/landing-page" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-foreground">chills.</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
      </main>
    </div>
  )
}