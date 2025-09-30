import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Upload } from "lucide-react"

export default function TimetableSetupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Chills</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step 1 of 3</span>
            <span className="text-sm text-muted-foreground">Setup Timetable</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "33%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload your timetable</h1>
            <p className="text-muted-foreground text-lg">
              Paste your iCal link to automatically sync your courses and schedule
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ical-link">iCal Link</Label>
                <Input
                  id="ical-link"
                  type="url"
                  placeholder="https://timetable.university.edu/ical/..."
                  className="h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Find your iCal link in your university timetable settings
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Upload .ics file</p>
                <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
                <input type="file" accept=".ics" className="hidden" />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">How to find your iCal link:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to your university timetable portal</li>
                  <li>Look for "Export" or "Subscribe" options</li>
                  <li>Copy the iCal or .ics link</li>
                  <li>Paste it above</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-12 bg-transparent" asChild>
                  <Link href="/onboarding/welcome">Back</Link>
                </Button>
                <Button type="submit" className="flex-1 h-12">
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
