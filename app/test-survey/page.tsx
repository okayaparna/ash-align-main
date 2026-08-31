"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FinishedScreen from "@/components/FinishedScreen";

function TestSurveyContent() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") as "control" | "test" | null;

  return (
    <FinishedScreen
      participantNames={["Aparna", "Josh"]}
      surveyVariant={variant || "control"}
      summary={JSON.stringify({
        summary: "You both showed up with real honesty today. Aparna, you shared that you've been feeling unheard when you bring up concerns about the household dynamic. Josh, you talked about feeling like you're walking on eggshells and unsure how to bring things up without it escalating.",
        insight: "What came through is that you both want the same thing: to feel safe enough to be honest. But the way each of you signals that need sometimes gets lost. Aparna, your directness reads to Josh as criticism. Josh, your withdrawal reads to Aparna as indifference. Neither of those readings is accurate.",
        recommendations: "Try a daily two-minute check-in: one person shares how they're feeling, the other simply says what they heard. No fixing, no reacting. Just listening. Start small, keep it low-stakes, and build from there."
      })}
    />
  );
}

export default function TestSurveyPage() {
  return (
    <Suspense>
      <TestSurveyContent />
    </Suspense>
  );
}
