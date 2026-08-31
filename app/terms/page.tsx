"use client";

import { useRouter } from "next/navigation";

export default function TermsOfUse() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-bg)] px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-[720px]">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              window.close();
            }
          }}
          className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-elevated)]"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="var(--contrast-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="mb-6 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] px-5 py-4">
          <p className="text-sm font-semibold uppercase leading-[1.5] text-[var(--contrast-strong)]">
            IF THIS IS A MEDICAL EMERGENCY OR CRISIS SITUATION, DIAL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY. ASH ALIGN IS NOT AN EMERGENCY SERVICE AND CANNOT PROVIDE CRISIS INTERVENTION.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="rounded-[24px] bg-[var(--surface-elevated)] p-[24px]">
            <p className="font-body text-[18px] font-bold leading-[1.2] tracking-[-0.1px] text-[var(--contrast-strong)]">
              Ash is an AI communication tool &mdash; not therapy
            </p>
            <p className="mt-6 font-body text-[14px] font-normal leading-[1.5] text-[var(--contrast-weak)]">
              Ash Align uses AI to help facilitate conversation. It is not a substitute for professional therapy, counseling, or medical care. Do not delay seeking professional help based on this experience.
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--surface-elevated)] p-[24px]">
            <p className="font-body text-[18px] font-bold leading-[1.2] tracking-[-0.1px] text-[var(--contrast-strong)]">
              Your data disappears when you&apos;re done
            </p>
            <p className="mt-6 font-body text-[14px] font-normal leading-[1.5] text-[var(--contrast-weak)]">
              This is an ephemeral demo session. All conversation data is permanently deleted when the session ends. No accounts are created. No cookies are used. If you choose to share your email, it will only be used to send you updates about Ash Align. You can unsubscribe at any time. We collect anonymous survey responses for research purposes only.
            </p>
          </div>
        </div>

        <h1 className="mb-2 font-display text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]">
          Terms of Use
        </h1>
        <p className="mb-10 text-sm leading-[1.5] text-[var(--contrast-weak)]">
          Last updated: March 23, 2026
        </p>

        <div className="flex flex-col gap-8">
          <Section num={1} title="What Ash Align Is">
            <p>
              Ash Align is an AI-powered communication tool designed to help two people engage in a guided conversation exercise. Ash Align is not therapy, counseling, or medical care. It is not a substitute for professional mental health services. The AI facilitator (&quot;Ash&quot;) is not a licensed therapist, psychologist, psychiatrist, or medical professional of any kind. Do not delay or avoid seeking professional help based on your experience with Ash Align.
            </p>
          </Section>

          <Section num={2} title="Eligibility">
            <p>
              You must be at least 18 years of age to use Ash Align. By using the service, you represent and warrant that you are 18 years of age or older. If you are under 18, you may not use Ash Align under any circumstances.
            </p>
          </Section>

          <Section num={3} title="How It Works">
            <p>
              Ash Align creates a temporary conversation space where two participants can engage in a structured communication exercise. Each participant first speaks privately with Ash, then both participants are brought together into a joint session moderated by Ash. The AI facilitator uses evidence-based communication techniques to guide the conversation, but it does not provide diagnoses, treatment plans, or clinical advice.
            </p>
          </Section>

          <Section num={4} title="Privacy &amp; Data">
            <p className="mb-3">
              <strong>What we collect:</strong> During your session, we temporarily process the text you enter in order to facilitate the conversation. We may collect anonymous survey responses for research purposes. If you voluntarily provide your email address, we collect it to send you updates about Ash Align.
            </p>
            <p className="mb-3">
              <strong>What we do NOT do:</strong> We do not create accounts for you. We do not use cookies for tracking. We do not sell, share, or distribute your conversation data to third parties. We do not use your conversation content to train AI models.
            </p>
            <p className="mb-3">
              <strong>When your session ends:</strong> All conversation data is permanently deleted within 24 hours of your session ending. We do not retain transcripts, summaries, or any record of what was discussed.
            </p>
            <p>
              <strong>Third-party services:</strong> Ash Align uses third-party AI services to power the conversation facilitator. Your conversation text is sent to these services for real-time processing only and is not retained by them beyond the immediate interaction, in accordance with their data processing agreements. We may use analytics services to understand how the product is used in aggregate. These analytics do not include conversation content.
            </p>
          </Section>

          <Section num={5} title="Your Conduct">
            <p>
              You agree to use Ash Align in good faith and for its intended purpose: constructive communication between two people. You may not use Ash Align to harass, threaten, or abuse another person. You may not use the service to facilitate illegal activity. You may not attempt to manipulate, exploit, or reverse-engineer the AI facilitator. We reserve the right to terminate any session that violates these terms.
            </p>
          </Section>

          <Section num={6} title="Safety">
            <p>
              Ash Align is not equipped to handle emergencies, crises, or situations involving abuse or violence. If you or someone you know is in immediate danger, call 911 or your local emergency number.
            </p>
            <p className="mt-3">
              If you or someone you know is experiencing domestic violence, contact the National Domestic Violence Hotline at <strong>1-800-799-7233</strong> or text <strong>START</strong> to <strong>88788</strong>. Help is available 24/7.
            </p>
            <p className="mt-3">
              Ash cannot contact anyone on your behalf. Ash cannot call emergency services. Ash cannot intervene in real-world situations.
            </p>
          </Section>

          <Section num={7} title="AI Disclosure">
            <p>
              Ash is an artificial intelligence. It generates responses based on patterns in training data and the context of your conversation. Ash does not have feelings, consciousness, or personal experiences. Ash may produce responses that are inaccurate, inappropriate, or unhelpful. Ash&apos;s suggestions should not be treated as professional advice. You are responsible for your own decisions and actions during and after using Ash Align.
            </p>
          </Section>

          <Section num={8} title="Intellectual Property">
            <p>
              All content, design, code, and materials associated with Ash Align are the property of Slingshot AI Inc. and are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any part of the service without prior written permission. Your conversation content remains yours, but you grant us a limited license to process it for the purpose of providing the service.
            </p>
          </Section>

          <Section num={9} title="Disclaimer of Warranties">
            <p className="uppercase">
              ASH ALIGN IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE MAKE NO REPRESENTATIONS ABOUT THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT GENERATED BY THE AI FACILITATOR. USE OF THE SERVICE IS AT YOUR OWN RISK.
            </p>
          </Section>

          <Section num={10} title="Limitation of Liability">
            <p className="uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SLINGSHOT AI INC. AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF ASH ALIGN, REGARDLESS OF THE THEORY OF LIABILITY. OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED ONE HUNDRED DOLLARS ($100.00).
            </p>
          </Section>

          <Section num={11} title="Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Slingshot AI Inc. and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of Ash Align, your violation of these Terms, or your violation of any rights of another person or entity.
            </p>
          </Section>

          <Section num={12} title="Dispute Resolution &amp; Arbitration">
            <p>
              These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any dispute arising out of or related to these Terms or your use of Ash Align shall be resolved through binding arbitration administered by JAMS in New York, New York, in accordance with JAMS Streamlined Arbitration Rules and Procedures.
            </p>
            <p className="mt-3 font-bold uppercase">
              YOU AGREE THAT BY ENTERING INTO THESE TERMS, YOU AND SLINGSHOT AI INC. ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY AND THE RIGHT TO PARTICIPATE IN A CLASS ACTION.
            </p>
          </Section>

          <Section num={13} title="Changes to Terms">
            <p>
              We reserve the right to update or modify these Terms at any time. If we make material changes, we will update the &quot;Last updated&quot; date at the top of this page. Your continued use of Ash Align after any changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </Section>

          <Section num={14} title="Contact">
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <p className="mt-3">
              Email: <a href="mailto:support@slingshotai.com" className="font-bold underline text-[var(--contrast-strong)]">support@slingshotai.com</a>
            </p>
            <p className="mt-1">
              Slingshot AI Inc.<br />
              228 Park Ave. S PMB 679458<br />
              New York, NY 10003
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold leading-[1.2] tracking-[-0.1px] text-[var(--contrast-strong)]">
        {num}. {title}
      </h2>
      <div className="text-sm leading-[1.5] text-[var(--contrast-weak)]">
        {children}
      </div>
    </section>
  );
}
