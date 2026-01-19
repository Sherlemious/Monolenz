import ApplicationFlowCard from "@/app/components/landing/ApplicationFlowCard";
import ApplyNowCard from "@/app/components/landing/ApplyNowCard";
import MasterProfileCard from "@/app/components/landing/MasterProfileCard";

export default function MarketingPage() {
  return (
    <div className="min-h-screen text-white px-6 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
          Your job search, on autopilot.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            MonoLenz acts on your behalf, handling your work history, job
            applications, and tracking in one place.
          </p>
        </div>
      </div>
      <div className="mt-10 w-full max-w-[150rem] mx-auto rounded-2xl bg-transparent p-6 lg:p-10">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-3 items-start">
          <MasterProfileCard />
          <ApplyNowCard />
          <ApplicationFlowCard />
        </div>
      </div>
    </div>
  );
}