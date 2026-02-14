import Link from "next/link";
import ApplicationFlowCard from "@/app/components/landing/ApplicationFlowCard";
import ApplyNowCard from "@/app/components/landing/ApplyNowCard";
import FeaturesSection from "@/app/components/landing/Features";
import MasterProfileCard from "@/app/components/landing/MasterProfileCard";

export default function MarketingPage() {
  return (
    <div className="min-h-screen text-foreground px-6 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
          Your job search, on autopilot.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            MonoLenz acts on your behalf, handling your work history, job
            applications, and tracking in one place.
          </p>
        </div>
      </div>
      <div className="mt-10 w-full max-w-[150rem] mx-auto rounded-2xl bg-transparent p-6 lg:p-10">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-6 border">
            <span>Overview</span>
          </div>
        </div>
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-3 items-start">
          <MasterProfileCard />
          <ApplyNowCard />
          <ApplicationFlowCard />
        </div>
      </div>
      <FeaturesSection />
      <section id="extension" className="px-4 py-20 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-4 border">
            <span>Browser Extension</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Apply automatically with our browser extension
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Use your data once and let our extension handle applications for you—fast, consistent, and always up to
            date.
          </p>
        </div>
      </section>
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">© 2026 Monolenz. All rights reserved.</span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}