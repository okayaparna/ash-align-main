"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface PostSurveyProps {
  onComplete: () => void;
  roomId?: string;
}

function LikertScale({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border text-sm font-medium transition-colors ${
              value === n
                ? "border-[var(--damson-400)] bg-[var(--damson-600)] text-[var(--damson-200)]"
                : "border-[var(--surface-high)] text-[var(--contrast-medium)] hover:border-[var(--damson-300)]"
            }`}
            aria-label={`${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-[var(--contrast-subtle)]">
          Strongly disagree
        </span>
        <span className="text-xs text-[var(--contrast-subtle)]">
          Strongly agree
        </span>
      </div>
    </div>
  );
}

export default function PostSurvey({ onComplete, roomId }: PostSurveyProps) {
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [disagreements, setDisagreements] = useState<number | null>(null);

  const allAnswered = satisfaction !== null && disagreements !== null;

  const handleSubmit = () => {
    if (!allAnswered) return;

    const surveyData = {
      survey_type: "post_session",
      room_id: roomId || "unknown",
      satisfaction_post: satisfaction,
      disagreements_post: disagreements,
    };

    try {
      posthog.capture("post_session_survey_completed", surveyData);
    } catch {
      // PostHog not initialized — continue silently
    }

    onComplete();
  };

  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-center text-sm font-medium uppercase tracking-[1.25px] text-[var(--damson-500)]"
      >
        Before you go — two quick questions
      </h2>
      <p className="text-center text-sm leading-[1.5] text-[var(--contrast-weak)]">
        This helps us understand if Ash Align is making a difference.
      </p>

      <div className="mt-3 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold leading-[1.5] text-[var(--contrast-strong)]">
            Please indicate how much you agree or disagree with the following
            statements:
          </legend>
          <div className="mt-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-[1.5] text-[var(--contrast-medium)]">
                In general, I am satisfied with this relationship.
              </p>
              <LikertScale
                name="post_satisfaction"
                value={satisfaction}
                onChange={setSatisfaction}
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm leading-[1.5] text-[var(--contrast-medium)]">
                We are able to resolve disagreements effectively.
              </p>
              <LikertScale
                name="post_disagreements"
                value={disagreements}
                onChange={setDisagreements}
              />
            </div>
          </div>
        </fieldset>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="flex h-14 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--damson-600)] text-base font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--damson-200)] disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
