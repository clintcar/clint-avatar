"use client";

const SCENARIO_PROMPTS: Record<string, string[]> = {
  "policymaker-jessica-newby": [
    "What concerns are you hearing from your constituents about this issue?",
    "What evidence would help you evaluate this proposal?",
    "Could we discuss the costs and how a small pilot might work?",
    "Before we finish, may I ask how effectively I presented my position?",
  ],
  "journalist-henry-hook": [
    "What would make this public health story newsworthy to your audience?",
    "Which facts or sources would you want me to verify?",
    "What questions should I address to make the issue clearer?",
    "Would you consider me a useful source for a future story? Why or why not?",
  ],
  "community-skeptical-joann-jackson": [
    "What experiences have shaped your feelings about public health advice?",
    "Can you tell me more about your biggest concern?",
    "What kind of information would feel useful or trustworthy to you?",
    "Did you feel heard during our conversation? What could I do differently?",
  ],
  "community-confrontational-michelle-smith": [
    "I hear that this is frustrating. What concerns you most?",
    "What would you like public health officials to understand about your experience?",
    "What would help you feel included in this decision?",
    "Did I address your questions respectfully? What could I improve?",
  ],
};

export function ConversationPrompts({ scenarioId }: { scenarioId: string }) {
  const prompts = SCENARIO_PROMPTS[scenarioId] ?? [];
  if (!prompts.length) return null;
  return (
    <details className="group border-t border-chwe-line bg-white text-chwe-ink">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold hover:bg-chwe-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-chwe-blue [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0 text-chwe-blue"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          Not sure what to say?
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-chwe-muted transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="border-t border-chwe-line bg-chwe-soft px-4 py-3">
        <p className="mb-2 text-xs text-chwe-muted">
          Try one of these conversation starters, or use your own words.
        </p>
        <ul className="space-y-2">
          {prompts.map((prompt) => (
            <li
              key={prompt}
              className="rounded-[4px] border border-chwe-line bg-white px-3 py-2 text-sm leading-relaxed"
            >
              “{prompt}”
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
