"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChandraExperience } from "@/components/ChandraExperience";
import { useOnboarding } from "@/store/OnboardingContext";

export default function DashboardPage() {
  const router = useRouter();
  const { agentName } = useOnboarding();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!agentName) {
      router.replace("/onboarding");
    }
  }, [agentName, mounted, router]);

  if (!mounted || !agentName) {
    return null;
  }

  return <ChandraExperience />;
}
