"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface PreSurveyProps {
  onComplete: () => void;
  roomId?: string;
}

const AGE_OPTIONS = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+"];

const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
];

const RELATIONSHIP_OPTIONS = [
  "Spouse / long-term partner",
  "Dating",
  "Friend",
  "Family member",
];

const LIKERT_LABELS = [
  "Strongly disagree",
  "",
  "",
  "",
  "",
  "",
  "Strongly agree",
];

function RadioGroup({
  name,
  options,
  value,
  onChange,
  other,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  other?: {
    enabled: boolean;
    placeholder: string;
    value: string;
    onValueChange: (v: string) => void;
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex h-[64px] cursor-pointer items-center rounded-[16px] px-[16px] font-body text-[16px] font-normal leading-[1.5] transition-colors ${
              selected
                ? "bg-[#171717] text-[#ffffff]"
                : "bg-[#f5f5f5] text-[#0a0a0a]"
            }`}
          >
            {opt}
          </button>
        );
      })}
      {other && (
        <button
          type="button"
          onClick={() => onChange("__other__")}
          className={`flex h-[64px] cursor-pointer items-center rounded-[16px] px-[16px] font-body text-[16px] font-normal leading-[1.5] transition-colors ${
            other.enabled && value === "__other__"
              ? "bg-[#171717] text-[#ffffff]"
              : "bg-[#f5f5f5] text-[#0a0a0a]"
          }`}
        >
          {other.enabled && value === "__other__" ? (
            <input
              type="text"
              placeholder={other.placeholder}
              value={other.value}
              onChange={(e) => {
                other.onValueChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="w-full bg-transparent font-body text-[16px] text-[#ffffff] outline-none placeholder:text-[#ffffff]/60"
            />
          ) : (
            other.placeholder
          )}
        </button>
      )}
    </div>
  );
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
            className={`flex h-11 w-11 items-center justify-center rounded-lg font-body text-[16px] font-medium transition-colors ${
              value === n
                ? "bg-[#171717] text-[#ffffff]"
                : "bg-[#f5f5f5] text-[#0a0a0a]"
            }`}
            aria-label={`${n} - ${LIKERT_LABELS[n - 1] || ""}`}
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

export default function PreSurvey({ onComplete, roomId }: PreSurveyProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [relationship, setRelationship] = useState("");
  const [relationshipOther, setRelationshipOther] = useState("");
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [disagreements, setDisagreements] = useState<number | null>(null);

  const allAnswered =
    age !== "" &&
    gender !== "" &&
    relationship !== "" &&
    satisfaction !== null &&
    disagreements !== null;

  const handleSubmit = () => {
    if (!allAnswered) return;

    const surveyData = {
      survey_type: "pre_session",
      room_id: roomId || "unknown",
      age,
      gender: gender === "__other__" ? `Self-described: ${genderOther}` : gender,
      relationship:
        relationship === "__other__"
          ? `Other: ${relationshipOther}`
          : relationship,
      satisfaction_pre: satisfaction,
      disagreements_pre: disagreements,
    };

    try {
      posthog.capture("pre_session_survey_completed", surveyData);
    } catch {
      // PostHog not initialized — continue silently
    }

    onComplete();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#ffffff]">
      <div className="animate-fade-in flex flex-col gap-3 px-6 pt-20 text-center lg:mx-auto lg:max-w-[600px]">
        <h1 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)]">
          Help Ash understand your relationship
        </h1>
        <p className="font-body text-[16px] font-normal leading-[1.5] text-[#404040]">
          5 quick questions help Ash personalize your session. Your responses
          are anonymous and used for research only.
        </p>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[600px] flex-col gap-8 px-6 pb-8">
        {/* Age */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
            What is your age?
          </legend>
          <RadioGroup name="age" options={AGE_OPTIONS} value={age} onChange={setAge} />
        </fieldset>

        {/* Gender */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
            What is your gender?
          </legend>
          <RadioGroup
            name="gender"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
            other={{
              enabled: gender === "__other__",
              placeholder: "Prefer to self-describe",
              value: genderOther,
              onValueChange: setGenderOther,
            }}
          />
        </fieldset>

        {/* Relationship */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
            What is the nature of your relationship to the person you&apos;ll be
            chatting with today?
          </legend>
          <RadioGroup
            name="relationship"
            options={RELATIONSHIP_OPTIONS}
            value={relationship}
            onChange={setRelationship}
            other={{
              enabled: relationship === "__other__",
              placeholder: "Other (please specify)",
              value: relationshipOther,
              onValueChange: setRelationshipOther,
            }}
          />
        </fieldset>

        {/* Likert: Satisfaction */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)] text-center">
            Please indicate how much you agree or disagree with the following
            statements:
          </legend>
          <div className="mt-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-[1.5] text-[var(--contrast-medium)]">
                In general, I am satisfied with this relationship.
              </p>
              <LikertScale
                name="satisfaction"
                value={satisfaction}
                onChange={setSatisfaction}
              />
            </div>

            {/* Likert: Disagreements */}
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-[1.5] text-[var(--contrast-medium)]">
                We are able to resolve disagreements effectively.
              </p>
              <LikertScale
                name="disagreements"
                value={disagreements}
                onChange={setDisagreements}
              />
            </div>
          </div>
        </fieldset>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)] disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
