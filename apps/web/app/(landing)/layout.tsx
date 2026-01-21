import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MonoLenz — Your job search, on autopilot",
  description:
    "Build a master profile once, generate tailored resumes, apply faster, and track every application in one place.",
  openGraph: {
    title: "MonoLenz — Your job search, on autopilot",
    description:
      "Build a master profile once, generate tailored resumes, apply faster, and track every application in one place.",
    type: "website",
  },
};

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return <>{children}</>;
}
