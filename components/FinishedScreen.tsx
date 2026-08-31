"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";

import { PostSurveyCard } from "./SurveyScreen";
import { POST_SURVEY_ID, POST_SURVEY_QUESTIONS, POST_SURVEY_QUESTIONS_B, isSurveyTestVariant } from "@/lib/surveys";

interface ConclusionSections {
  summary: string;
  insight: string;
  recommendations: string;
}

interface FinishedScreenProps {
  participantNames: [string, string];
  summary?: string;
  surveyVariant?: "control" | "test";
}

function parseSections(
  raw: string | undefined,
  names: [string, string]
): ConclusionSections {
  if (raw) {
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      // Combined format
      if (parsed.summary && parsed.insight && parsed.recommendations) {
        return {
          summary: parsed.summary,
          insight: parsed.insight,
          recommendations: parsed.recommendations,
        };
      }
      // Legacy per-partner format — combine into one
      if (parsed.partnerA && parsed.partnerB) {
        return {
          summary: `${parsed.partnerA} ${parsed.partnerB}`,
          insight: parsed.insight || "",
          recommendations: parsed.recommendations || "",
        };
      }
    } catch {
      return {
        summary: raw,
        insight: "",
        recommendations: "",
      };
    }
  }

  return {
    summary: `${names[0]} and ${names[1]}, you both showed up and shared what was really on your minds. That matters.`,
    insight: "What came through is a pattern where both of you want to feel heard, but the way you each signal that need sometimes gets lost in translation.",
    recommendations: "Try a daily two-minute check-in: one person shares how they're feeling, the other simply says what they heard. No fixing, no reacting. Just listening.",
  };
}

export default function FinishedScreen({
  participantNames,
  summary,
  surveyVariant,
}: FinishedScreenProps) {
  const isTestVariant = surveyVariant
    ? surveyVariant === "test"
    : isSurveyTestVariant();
  const sections = useMemo(
    () => parseSections(summary, participantNames),
    [summary, participantNames]
  );

  // Fire session_completed when conclusion screen mounts
  useEffect(() => {
    try {
      posthog.capture("session_completed");
    } catch {
      // PostHog not initialized
    }
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--surface-bg)]">
      <div className="relative z-10 mx-auto flex max-w-[600px] flex-col items-center px-6 pt-[73px] pb-16">
        <h1
          className="font-display max-w-[480px] text-center text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]"
        >
          Thank you for completing your session
        </h1>

        {/* Demo reminder */}
        <p className="mt-4 max-w-[360px] text-center text-sm leading-[1.5] text-[var(--contrast-weak)]">
          Reminder, this is a demo and everything you shared here will be deleted within 24 hours. No accounts, no cookies.
        </p>

        {/* Combined summary + insight + recommendations */}
        <div className="mt-10 flex w-full flex-col gap-6">
          {/* What I heard */}
          {sections.summary && (
            <div className="w-full rounded-[var(--radius-md)] bg-[var(--surface-bg)] px-6 py-6 shadow-sm">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[1.25px] text-[var(--damson-500)]">
                Here&apos;s what I heard you say
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.summary}
              </p>
            </div>
          )}

          {/* Insight */}
          {sections.insight && (
            <div className="w-full rounded-[var(--radius-md)] bg-[var(--surface-bg)] px-6 py-6 shadow-sm">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[1.25px] text-[var(--damson-500)]">
                What I noticed
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.insight}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {sections.recommendations && (
            <div className="w-full rounded-[var(--radius-md)] bg-[var(--surface-bg)] px-6 py-6 shadow-sm">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[1.25px] text-[var(--damson-500)]">
                Where to go from here
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.recommendations}
              </p>
            </div>
          )}
        </div>

        {/* Post-session survey */}
        <div className="mt-10 w-full">
          <PostSurveyCard
            surveyId={POST_SURVEY_ID}
            title="Before you go"
            subtitle="This helps us understand if Ash Align is making a difference."
            questions={isTestVariant ? POST_SURVEY_QUESTIONS_B : POST_SURVEY_QUESTIONS}
          />
        </div>
      </div>
    </div>
  );
}
