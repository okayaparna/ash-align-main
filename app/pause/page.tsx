"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";

const FONT_STYLE = { fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.025em' };

const INIT = "INIT";
const SUBMITTING = "SUBMITTING";
const ERROR = "ERROR";
const SUCCESS = "SUCCESS";
const formStates = [INIT, SUBMITTING, ERROR, SUCCESS] as const;

const formStyles = {
  id: "cltct64b6003l3ri5i8x0ueud",
  formStyle: "buttonBelow",
  placeholderText: "you@example.com",
  formFont: "Inter",
  formFontColor: "#000000",
  formFontSizePx: 14,
  buttonText: "Join Waitlist",
  buttonFont: "Inter",
  buttonFontColor: "#ffffff",
  buttonColor: "#171717",
  buttonFontSizePx: 14,
  successMessage: "Thanks! We'll be in touch!",
  successFont: "Inter",
  successFontColor: "#000000",
  successFontSizePx: 14,
  userGroup: "Ash Align Waitlist",
};
const domain = "app.loops.so";

function isValidEmail(email: string) {
  return /.+@.+/.test(email);
}

function LoopsSignUpForm() {
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<typeof formStates[number]>(INIT);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setEmail("");
    setFormState(INIT);
    setErrorMessage("");
  };

  const hasRecentSubmission = () => {
    const time = new Date();
    const timestamp = time.valueOf();
    const previousTimestamp = localStorage.getItem("loops-form-timestamp");

    if (
      previousTimestamp &&
      Number(previousTimestamp) + 60 * 1000 > timestamp
    ) {
      setFormState(ERROR);
      setErrorMessage("Too many signups, please try again in a little while");
      return true;
    }

    localStorage.setItem("loops-form-timestamp", timestamp.toString());
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState !== INIT) return;
    if (!isValidEmail(email)) {
      setFormState(ERROR);
      setErrorMessage("Please enter a valid email");
      return;
    }
    if (hasRecentSubmission()) return;
    setFormState(SUBMITTING);

    // Track in PostHog
    if (posthog) {
      posthog.identify(posthog.get_distinct_id(), { email: email.trim(), source: "pause_page_signup" });
      posthog.capture("pause_page_email_signup", { email: email.trim() });
    }

    const formBody = `userGroup=${encodeURIComponent(
      formStyles.userGroup
    )}&email=${encodeURIComponent(email)}&mailingLists=cmnncjtap01kk0i028olu9nhv`;

    fetch(`https://${domain}/api/newsletter-form/${formStyles.id}`, {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res: Response) => [res.ok, res.json(), res] as const)
      .then(([ok, dataPromise, res]) => {
        if (ok) {
          resetForm();
          setFormState(SUCCESS);
        } else {
          dataPromise.then((data: { message?: string }) => {
            setFormState(ERROR);
            setErrorMessage(data.message || res.statusText);
            localStorage.setItem("loops-form-timestamp", "");
          });
        }
      })
      .catch((error) => {
        setFormState(ERROR);
        if (error.message === "Failed to fetch") {
          setErrorMessage("Too many signups, please try again in a little while");
        } else if (error.message) {
          setErrorMessage(error.message);
        }
        localStorage.setItem("loops-form-timestamp", "");
      });
  };

  const isInline = formStyles.formStyle === "inline";

  if (formState === SUCCESS) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <p style={{
          fontFamily: `'${formStyles.successFont}', sans-serif`,
          color: formStyles.successFontColor,
          fontSize: `${formStyles.successFontSizePx}px`,
        }}>
          {formStyles.successMessage}
        </p>
      </div>
    );
  }

  if (formState === ERROR) {
    return (
      <>
        <div style={{ alignItems: "center", justifyContent: "center", width: "100%" }}>
          <p style={{ fontFamily: "Inter, sans-serif", color: "rgb(185, 28, 28)", fontSize: "14px" }}>
            {errorMessage || "Oops! Something went wrong, please try again"}
          </p>
        </div>
        <button
          style={{
            color: "#737373",
            font: "14px, Inter, sans-serif",
            margin: "10px auto",
            textAlign: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onClick={resetForm}
        >
          &larr; Back
        </button>
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: isInline ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <input
        type="text"
        name="email"
        placeholder={formStyles.placeholderText}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
          color: formStyles.formFontColor,
          fontFamily: `'${formStyles.formFont}', sans-serif`,
          fontSize: `${formStyles.formFontSizePx}px`,
          margin: isInline ? "0px 10px 0px 0px" : "0px 0px 10px",
          width: "100%",
          maxWidth: "300px",
          minWidth: "100px",
          background: "#FFFFFF",
          border: "1px solid #e5e5e5",
          boxSizing: "border-box" as const,
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px",
          borderRadius: "6px",
          padding: "8px 12px",
        }}
      />
      <button
        type="submit"
        style={{
          background: formStyles.buttonColor,
          fontSize: `${formStyles.buttonFontSizePx}px`,
          color: formStyles.buttonFontColor,
          fontFamily: `'${formStyles.buttonFont}', sans-serif`,
          width: isInline ? "min-content" : "100%",
          maxWidth: "300px",
          whiteSpace: isInline ? "nowrap" : "normal",
          height: "38px",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row" as const,
          padding: "9px 17px",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
          borderRadius: "6px",
          textAlign: "center" as const,
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {formState === SUBMITTING ? "Please wait..." : formStyles.buttonText}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--surface-bg)]">
      <div className="z-10 mx-auto flex w-full max-w-[520px] flex-col items-center px-6">
        {/* Title */}
        <div className="flex items-baseline justify-center" style={{ gap: "clamp(8px, 2vw, 14px)" }}>
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              fontSize: "clamp(48px, 10vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            Align
          </span>
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              fontSize: "clamp(28px, 6vw, 40px)",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            with
          </span>
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              fontSize: "clamp(48px, 10vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            Ash
          </span>
        </div>

        {/* Body */}
        <div className="mt-10 flex flex-col gap-5 text-center">
          <p className="font-display text-[20px] leading-[1.2] tracking-[-0.5px] text-[var(--wood-700)]">
            We&apos;re on pause.
          </p>
          <p className="font-body text-[15px] leading-[1.6] text-[var(--contrast-medium)]">
            We recently ran Ash Align as an experiment to explore whether Ash could help two people have the conversation they&apos;ve been avoiding.
          </p>
          <p className="font-body text-[15px] leading-[1.6] text-[var(--contrast-medium)]">
            People responded really well. They told us the experience felt deeply human, that Ash helped surface things they couldn&apos;t say on their own, and that the session summaries gave them something concrete to take away. They also emphasized the importance of having a voice option and knowing that their conversations were completely private.
          </p>
          <p className="font-body text-[15px] leading-[1.6] text-[var(--contrast-medium)]">
            We&apos;re taking all of that with us as we figure out what comes next. If you&apos;d like to hear about it when we have news, leave your email below and we&apos;ll keep you in the loop.
          </p>
        </div>

        {/* Email signup */}
        <div className="mt-8 w-full">
          <LoopsSignUpForm />
        </div>

        {/* Sign-off */}
        <div className="mt-8 flex flex-col gap-1 text-center">
          <p className="font-body text-[15px] leading-[1.6] text-[var(--contrast-medium)]">
            Thanks for your interest.
          </p>
          <p className="font-body text-[14px] leading-[1.6] text-[var(--contrast-weak)]">
            The Ash team
          </p>
        </div>
      </div>
    </div>
  );
}
