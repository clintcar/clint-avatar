"use client";
const SCENARIO_PROMPTS:Record<string,string[]>={"alex-involvement":["How do you think that encounter went?","Can we discuss a specific behavior I observed?","What could you try differently next time?","Can you summarize the next step we agreed on?"],"morgan-introspection":["How do you think that encounter went?","Can we discuss a specific behavior I observed?","What could you try differently next time?","Can you summarize the next step we agreed on?"],"lina-integrity":["How do you think that encounter went?","Can we discuss a specific behavior I observed?","What could you try differently next time?","Can you summarize the next step we agreed on?"],"chris-interaction":["How do you think that encounter went?","Can we discuss a specific behavior I observed?","What could you try differently next time?","Can you summarize the next step we agreed on?"]};
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
