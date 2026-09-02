"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";

import SurveyScreen from "./SurveyScreen";
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

  /* The conclusion ends with a CTA, then an intro screen explains why we are
     asking, then the questions — the same shape as the pre-session survey. */
  const [step, setStep] = useState<"summary" | "intro" | "survey">("summary");
  const [surveyStart, setSurveyStart] = useState(0);

  const questions = isTestVariant ? POST_SURVEY_QUESTIONS_B : POST_SURVEY_QUESTIONS;
  /* The trailing `link` page is a recommendation, not a question — don't count
     it when telling people how many there are. */
  const answerableCount = questions.filter((q) => q.type !== "link").length;

  // Fire session_completed when conclusion screen mounts
  useEffect(() => {
    try {
      posthog.capture("session_completed");
    } catch {
      // PostHog not initialized
    }
  }, []);

  if (step === "intro") {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--birch)]">
        <div className="px-6 pt-6">
          <button
            onClick={() => setStep("summary")}
            aria-label="Back to your summary"
            className="flex h-11 w-11 items-center justify-center border border-[var(--hairline)] text-[var(--ink)] transition-colors duration-500 hover:bg-[var(--ink)] hover:text-[var(--birch)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="icon" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="section-title text-[34px] lg:text-[44px]">Before you go</h1>
          <p className="text-[16px] leading-[1.35] text-[var(--contrast-medium)]">
            {answerableCount} quick questions help us understand if Ash Align is
            making a difference. Your responses are anonymous and used for
            research only.
          </p>
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-[465px] flex-col items-center gap-4 px-6">
          <button
            onClick={() => {
              setSurveyStart(0);
              setStep("survey");
            }}
            className="button button--black button--block"
          >
            Continue
          </button>
          {/* Skipping lands on the closing recommendation rather than dead-ending,
              and records nothing — the survey only submits on the way into that
              page from an answered question. */}
          <button
            onClick={() => {
              setSurveyStart(questions.length - 1);
              setStep("survey");
            }}
            className="font-body text-[14px] font-bold text-[var(--contrast-weak)]"
          >
            skip
          </button>
        </div>
      </div>
    );
  }

  if (step === "survey") {
    return (
      <SurveyScreen
        surveyId={POST_SURVEY_ID}
        title="Before you go"
        subtitle="This helps us understand if Ash Align is making a difference."
        questions={questions}
        startIndex={surveyStart}
        onComplete={() => {}}
        onBack={() => setStep("intro")}
      />
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--birch)]">
      <div className="relative z-10 mx-auto flex max-w-[600px] flex-col items-center px-6 pt-[73px] pb-16">
        <h1
          className="section-title max-w-[480px] text-center text-[32px] lg:text-[40px]"
        >
          Thank you for completing your session
        </h1>

        {/* Demo reminder */}
        <p className="mt-4 max-w-[360px] text-center text-sm leading-[1.5] text-[var(--contrast-weak)]">
          Reminder, this is a demo and everything you shared here will be deleted within 48 hours. No accounts, no cookies.
        </p>

        {/* Combined summary + insight + recommendations */}
        <div className="mt-10 flex w-full flex-col gap-6">
          {/* What I heard */}
          {sections.summary && (
            <div className="w-full bg-[rgba(0,0,0,0.05)] px-6 py-7">
              <h2 className="eyebrow mb-3 text-[var(--contrast-weak)]">
                Here&apos;s what I heard you say
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.summary}
              </p>
            </div>
          )}

          {/* Insight */}
          {sections.insight && (
            <div className="w-full bg-[rgba(0,0,0,0.05)] px-6 py-7">
              <h2 className="eyebrow mb-3 text-[var(--contrast-weak)]">
                What I noticed
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.insight}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {sections.recommendations && (
            <div className="w-full bg-[rgba(0,0,0,0.05)] px-6 py-7">
              <h2 className="eyebrow mb-3 text-[var(--contrast-weak)]">
                Where to go from here
              </h2>
              <p className="text-base leading-[1.5] text-[var(--contrast-strong)]">
                {sections.recommendations}
              </p>
            </div>
          )}
        </div>

        {/* Closes the summary. The questions that used to sit inline here now
            follow on their own pages. */}
        <div className="mt-12 w-full">
          <button
            onClick={() => setStep("intro")}
            className="button button--black button--block"
          >
            End this session
          </button>
        </div>
      </div>
    </div>
  );
}
