"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import type { SurveyQuestion } from "@/lib/surveys";

interface SurveyScreenProps {
  surveyId: string;
  title: string;
  subtitle: string;
  questions: SurveyQuestion[];
  onComplete: () => void;
  onBack?: () => void;
}

function SingleChoiceInput({
  question,
  choices,
  hasOpenChoice,
  value,
  openValue,
  onChange,
  onOpenChange,
}: {
  question: string;
  choices: string[];
  hasOpenChoice?: boolean;
  value: string;
  openValue: string;
  onChange: (v: string) => void;
  onOpenChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
        {question}
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {choices.map((choice, i) => {
          const isOpen = hasOpenChoice && i === choices.length - 1;
          const selected = value === choice;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onChange(choice)}
              className={`flex h-[64px] w-full items-center rounded-[16px] px-[16px] text-left font-body text-[16px] font-normal leading-[1.5] transition-colors ${
                selected
                  ? "bg-[#a66c94] text-[#fcfcfc]"
                  : "bg-[#f1f0ed] text-[#282828]"
              }`}
            >
              <span className="flex-1">
                {isOpen && selected ? (
                  <input
                    type="text"
                    value={openValue}
                    onChange={(e) => onOpenChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={choice}
                    autoFocus
                    className="w-full bg-transparent font-body text-[16px] text-[#fcfcfc] outline-none placeholder:text-[#fcfcfc]/60"
                  />
                ) : (
                  choice
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RatingInput({
  question,
  scale,
  lowerBoundLabel,
  upperBoundLabel,
  value,
  onChange,
}: {
  question: string;
  scale: number;
  lowerBoundLabel: string;
  upperBoundLabel: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
        {question}
      </h2>
      <div className="mt-4 flex justify-between gap-1.5">
        {Array.from({ length: scale }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-11 w-11 items-center justify-center rounded-lg font-body text-[16px] font-medium transition-colors ${
              value === n
                ? "bg-[#a66c94] text-[#fcfcfc]"
                : "bg-[#f1f0ed] text-[#282828]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-[var(--contrast-weak)]">
          {lowerBoundLabel}
        </span>
        <span className="text-xs text-[var(--contrast-weak)]">
          {upperBoundLabel}
        </span>
      </div>
    </div>
  );
}

export default function SurveyScreen({
  surveyId,
  title,
  subtitle,
  questions,
  onComplete,
  onBack,
}: SurveyScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [openTexts, setOpenTexts] = useState<Record<number, string>>({});
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Fire survey_shown when the pre-survey screen mounts
  useEffect(() => {
    try {
      posthog.capture("survey_shown", { $survey_id: surveyId });
    } catch {
      // PostHog not initialized
    }
  }, [surveyId]);

  const goToSlide = (nextIndex: number) => {
    const direction = nextIndex > currentIndex ? "left" : "right";
    setSlideDirection(direction);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setSlideDirection(direction === "left" ? "right" : "left");
      setTimeout(() => {
        setSlideDirection(null);
        setAnimating(false);
      }, 20);
    }, 250);
  };

  const submitSurvey = (finalAnswers: Record<number, string | number>) => {
    const payload: Record<string, unknown> = {
      $survey_id: surveyId,
    };
    questions.forEach((_, i) => {
      const key = i === 0 ? "$survey_response" : `$survey_response_${i}`;
      const ans = finalAnswers[i];
      const q = questions[i];
      if (
        q.type === "single_choice" &&
        q.hasOpenChoice &&
        ans === q.choices[q.choices.length - 1] &&
        openTexts[i]
      ) {
        payload[key] = openTexts[i];
      } else {
        payload[key] = ans;
      }
    });
    posthog.capture("survey sent", payload);
    posthog.capture("survey_sent", payload);
  };

  const advance = (updatedAnswers: Record<number, string | number>) => {
    if (isLast) {
      submitSurvey(updatedAnswers);
      onComplete();
    } else {
      setTimeout(() => goToSlide(currentIndex + 1), 350);
    }
  };

  const handleSkip = () => {
    if (isLast) {
      submitSurvey(answers);
      onComplete();
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fcfcfc]">
      <div className="px-6 pt-6">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              goToSlide(currentIndex - 1);
            } else if (onBack) {
              onBack();
            }
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#f1f0ed] ${
            currentIndex === 0 && !onBack ? "invisible" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#282828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-[#8e521f]"
                  : i < currentIndex
                    ? "bg-[#8e521f]/40"
                    : "bg-[#f1f0ed]"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className="mx-auto mt-12 flex w-full max-w-[465px] flex-col gap-6 px-6"
        style={{
          transform: slideDirection === "left"
            ? "translateX(-100%)"
            : slideDirection === "right"
              ? "translateX(100%)"
              : "translateX(0)",
          opacity: slideDirection ? 0 : 1,
          transition: animating ? "transform 250ms ease-in-out, opacity 250ms ease-in-out" : "none",
        }}
      >
        {question.type === "single_choice" && (
          <SingleChoiceInput
            key={currentIndex}
            question={question.question}
            choices={question.choices}
            hasOpenChoice={question.hasOpenChoice}
            value={(answers[currentIndex] as string) ?? ""}
            openValue={openTexts[currentIndex] ?? ""}
            onChange={(v) => {
              const updated = { ...answers, [currentIndex]: v };
              setAnswers(updated);
              // Auto-advance unless it's an open-choice that needs text input
              const q = questions[currentIndex];
              const isOpenChoice = q.type === "single_choice" && q.hasOpenChoice && v === q.choices[q.choices.length - 1];
              if (!isOpenChoice) {
                advance(updated);
              }
            }}
            onOpenChange={(v) =>
              setOpenTexts((prev) => ({ ...prev, [currentIndex]: v }))
            }
          />
        )}
        {question.type === "rating" && (
          <RatingInput
            key={currentIndex}
            question={question.question}
            scale={question.scale}
            lowerBoundLabel={question.lowerBoundLabel}
            upperBoundLabel={question.upperBoundLabel}
            value={(answers[currentIndex] as number) ?? null}
            onChange={(v) => {
              const updated = { ...answers, [currentIndex]: v };
              setAnswers(updated);
              advance(updated);
            }}
          />
        )}

        <button
          onClick={handleSkip}
          className="pb-4 font-body text-[14px] font-bold text-[#6b6b6b]"
        >
          skip
        </button>
      </div>
    </div>
  );
}

/**
 * Consolidated 2-slide post-survey card for FinishedScreen.
 * Slide 1: Both rating questions stacked together
 * Slide 2: Feedback textarea + email input + submit
 */
export function PostSurveyCard({
  surveyId,
  title,
  subtitle,
  questions,
}: {
  surveyId: string;
  title: string;
  subtitle: string;
  questions: SurveyQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fire post_survey_shown when the post-survey card mounts
  useEffect(() => {
    try {
      posthog.capture("post_survey_shown", { $survey_id: surveyId });
    } catch {
      // PostHog not initialized
    }
  }, [surveyId]);

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      $survey_id: surveyId,
    };
    questions.forEach((_, i) => {
      const key = i === 0 ? "$survey_response" : `$survey_response_${i}`;
      payload[key] = answers[i] ?? "";
    });
    posthog.capture("survey sent", payload);
    posthog.capture("post_survey_sent", payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full py-6 text-center">
        <p className="text-base leading-[1.5] text-[var(--contrast-medium)]">
          Thank you for your feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      {/* Title + subtitle */}
      <div className="mb-6">
        <h2 className="font-display mb-1 text-center text-[24px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
          {title}
        </h2>
        <p className="text-center text-sm leading-[1.5] text-[var(--contrast-weak)]">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col gap-8">
        {questions.map((q, i) => {
          if (q.type === "rating") {
            return (
              <div key={i} className="flex flex-col gap-3">
                <p className="font-display text-center text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
                  {q.question}
                </p>
                <div className="flex w-full justify-between gap-1.5">
                  {Array.from({ length: q.scale }, (_, j) => j + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [i]: n }))
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full font-body text-[16px] font-medium transition-colors duration-200 ${
                        answers[i] === n
                          ? "bg-[#a66c94] text-[#fcfcfc]"
                          : "bg-[#f1f0ed] text-[#282828]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex w-full justify-between">
                  <span className="text-xs text-[var(--contrast-weak)]">
                    {q.lowerBoundLabel}
                  </span>
                  <span className="text-xs text-[var(--contrast-weak)]">
                    {q.upperBoundLabel}
                  </span>
                </div>
              </div>
            );
          }

          if (q.type === "single_choice") {
            return (
              <div key={i} className="flex flex-col gap-3">
                <p className="font-display text-center text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
                  {q.question}
                </p>
                <div className="flex w-full justify-center gap-3">
                  {q.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [i]: choice }))
                      }
                      className={`flex h-11 items-center justify-center rounded-full px-6 font-body text-[16px] font-medium transition-colors duration-200 ${
                        answers[i] === choice
                          ? "bg-[#a66c94] text-[#fcfcfc]"
                          : "bg-[#f1f0ed] text-[#282828]"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (q.type === "link") {
            return (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="font-display text-center text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
                  {q.question}
                </p>
                <a
                  href={q.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handleSubmit();
                    try {
                      posthog.capture("app_store_link_clicked", { url: q.linkUrl });
                    } catch {
                      // PostHog not initialized
                    }
                  }}
                  className="flex h-[56px] w-full items-center justify-center rounded-[16px] bg-[#282828] font-body text-[16px] font-medium leading-[1.2] tracking-[-0.25px] text-[#fcfcfc]"
                >
                  {q.linkText}
                </a>
              </div>
            );
          }

          if (q.type === "open_text") {
            return (
              <div key={i} className="flex flex-col gap-2">
                <p className="font-display text-center text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
                  {q.question}
                </p>
                <textarea
                  placeholder={q.placeholder}
                  value={(answers[i] as string) ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [i]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-[16px] bg-[#f1f0ed] px-[24px] py-[16px] font-body text-[16px] text-[#282828] outline-none placeholder:text-[#282828]/40"
                />
              </div>
            );
          }

          if (q.type === "email") {
            return (
              <div key={i} className="flex flex-col gap-2">
                <p className="font-display text-center text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--contrast-strong)]">
                  {q.question}
                </p>
                <input
                  type="email"
                  placeholder={q.placeholder}
                  value={(answers[i] as string) ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [i]: e.target.value,
                    }))
                  }
                  className="h-[56px] w-full rounded-[16px] bg-[#f1f0ed] px-[24px] font-body text-[16px] text-[#282828] outline-none placeholder:text-[#282828]/40"
                />
                <p className="text-xs leading-[1.5] text-[var(--contrast-subtle)]">
                  {q.disclaimer}
                </p>
              </div>
            );
          }

          return null;
        })}

      </div>
    </div>
  );
}
