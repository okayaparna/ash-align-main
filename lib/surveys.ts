import posthog from "posthog-js";

export const PRE_SURVEY_ID = "019d0c9e-00bd-0000-dd69-f43e0f707dc5";
export const POST_SURVEY_ID = "019d0c9e-0592-0000-6365-57d7c53c870f";

/** Returns true if the user is in the "test" variant of the survey A/B test.
 *  Supports ?variant=test query param override for local testing. */
export function isSurveyTestVariant(): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("variant");
    if (override) return override === "test";
  }
  return posthog.getFeatureFlag("survey-ab-test") === "test";
}

export type SurveyQuestionType = "single_choice" | "rating" | "email" | "open_text" | "link";

export interface SingleChoiceQuestion {
  type: "single_choice";
  question: string;
  choices: string[];
  hasOpenChoice?: boolean;
}

export interface RatingQuestion {
  type: "rating";
  question: string;
  scale: number;
  lowerBoundLabel: string;
  upperBoundLabel: string;
}

export interface EmailQuestion {
  type: "email";
  question: string;
  placeholder: string;
  disclaimer: string;
}

export interface OpenTextQuestion {
  type: "open_text";
  question: string;
  placeholder: string;
}

export interface LinkQuestion {
  type: "link";
  question: string;
  linkText: string;
  linkUrl: string;
}

export type SurveyQuestion = SingleChoiceQuestion | RatingQuestion | EmailQuestion | OpenTextQuestion | LinkQuestion;

export const PRE_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    type: "single_choice",
    question: "What is your age?",
    choices: ["18\u201324", "25\u201334", "35\u201344", "45\u201354", "55\u201364", "65+"],
  },
  {
    type: "single_choice",
    question: "What is your gender?",
    choices: ["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"],
    hasOpenChoice: true,
  },
  {
    type: "single_choice",
    question: "What is the nature of your relationship to the person you\u2019ll be chatting with today?",
    choices: [
      "Spouse / long-term partner",
      "Dating",
      "Friend",
      "Family member",
      "Other (please specify)",
    ],
    hasOpenChoice: true,
  },
  {
    type: "rating",
    question: "In general, I am satisfied with this relationship.",
    scale: 7,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
  {
    type: "rating",
    question: "We are able to resolve disagreements effectively.",
    scale: 7,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
];

export const POST_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    type: "rating",
    question: "In general, I am satisfied with this relationship.",
    scale: 7,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
  {
    type: "rating",
    question: "We are able to resolve disagreements effectively.",
    scale: 7,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
  {
    type: "single_choice",
    question: "Would you use Ash Align again?",
    choices: ["Yes", "No"],
  },
  {
    type: "link",
    question: "We recommend that you debrief your session with Ash.",
    linkText: "Talk to Ash",
    linkUrl: "https://apps.apple.com/us/app/ash-ai-for-personal-growth/id6474862947",
  },
];

// ── A/B Test Variants (feature flag: survey-ab-test) ──

// Version B: Pre-survey without the last 2 rating questions
export const PRE_SURVEY_QUESTIONS_B: SurveyQuestion[] = [
  {
    type: "single_choice",
    question: "What is your age?",
    choices: ["18\u201324", "25\u201334", "35\u201344", "45\u201354", "55\u201364", "65+"],
  },
  {
    type: "single_choice",
    question: "What is your gender?",
    choices: ["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"],
    hasOpenChoice: true,
  },
  {
    type: "single_choice",
    question: "What is the nature of your relationship to the person you\u2019ll be chatting with today?",
    choices: [
      "Spouse / long-term partner",
      "Dating",
      "Friend",
      "Family member",
      "Other (please specify)",
    ],
    hasOpenChoice: true,
  },
];

// Version B: Post-survey with new 5-point rating questions
export const POST_SURVEY_QUESTIONS_B: SurveyQuestion[] = [
  {
    type: "rating",
    question: "Ash Align helped me and my partner communicate more effectively.",
    scale: 5,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
  {
    type: "rating",
    question: "Using Ash Align helped strengthen my relationship.",
    scale: 5,
    lowerBoundLabel: "Strongly disagree",
    upperBoundLabel: "Strongly agree",
  },
  {
    type: "single_choice",
    question: "Would you use Ash Align again?",
    choices: ["Yes", "No"],
  },
  {
    type: "link",
    question: "We recommend that you debrief your session with Ash.",
    linkText: "Talk to Ash",
    linkUrl: "https://apps.apple.com/us/app/ash-ai-for-personal-growth/id6474862947",
  },
];
