"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, MessageSquare } from "lucide-react"
import { Typewriter } from "../../components/ui/typewriter";
import { ContainerScroll } from "../../components/ui/container-scroll-animation";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-foreground">chills.</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header> */}

      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance">
            Study in a group of{" "}
            <Typewriter
                words={["two", "five", "six", "three", "four", "seven"]}
                className="text-blue-500"
            />,
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Connect with classmates, sync your timetable, and form study groups effortlessly
            </p>
            <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full">
                Start chilling
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
        </div>
        </section>

        <div className="flex flex-col overflow-hidden">
        <ContainerScroll
            titleComponent={
            <>
                <h1 className="text-4xl font-semibold text-black dark:text-white">
                Unleash the power of <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                    Studying together
                </span>
                </h1>
            </>
            }
        >
            <img
            src="/assets/image.png"
            alt="hero"
            height={700}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
            />
        </ContainerScroll>
        </div>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to find your study squad?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Join students who are already studying smarter together
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-full">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">© 2025 chills.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
