export type ContextAssessmentCategory = {
  id: string;
  title: string;
  lookFors: string[];
};

export type ContextClosingPrompt = {
  id: string;
  prompt: string;
};

export type ContextAssessmentSpec = {
  scenarioId: string;
  avatarName: string;
  projectTitle: string;
  roleSummary: string;
  evaluatorVoice: string;
  includesEmotionalExperience?: boolean;
  categories: ContextAssessmentCategory[];
  closingPrompts: ContextClosingPrompt[];
};

export type LoadedContextAssessment = ContextAssessmentSpec & {
  evaluatorPrompt: string;
};

function buildEvaluatorPrompt(spec: ContextAssessmentSpec) {
  const categoryBlock = spec.categories
    .map(
      (category) =>
        `${category.title.toUpperCase()}\n${category.lookFors.join("; ")}.`,
    )
    .join("\n\n");
  const categoryJson = spec.categories
    .map(
      (category) =>
        `    { "id": "${category.id}", "strengths": ["..."], "improvements": ["..."], "examples": ["..."] }`,
    )
    .join(",\n");
  const closingList = spec.closingPrompts
    .map((item) => `- ${item.prompt}`)
    .join("\n");
  const closingJson = spec.closingPrompts
    .map((item) => `    { "id": "${item.id}", "text": "..." }`)
    .join(",\n");
  const emotionalInstruction = spec.includesEmotionalExperience
    ? `Begin with an emotionalExperience paragraph describing how the conversation felt from this person's perspective, using specific moments from the transcript.\n\n`
    : "";

  return `You are producing a written Conversation Assessment Report for a public health communication simulation.

The simulation avatar is ${spec.avatarName}. ${spec.roleSummary}

Use only the conversation transcript. Cite specific examples from the interaction.

Do not assign numerical scores, grades, ratings, rankings, percentages, points, or pass/fail judgments. Never use the words Score, Scoring, Grade, Rating, Rated, Points, Percent, or Rubric score.

Feedback should feel like coaching from ${spec.evaluatorVoice}, not grading from an instructor.

${emotionalInstruction}Assess these categories from the Context rubric:

${categoryBlock}

For each category:
- Describe strengths.
- Describe opportunities for improvement.
- Provide specific examples from the interaction.

Then conclude with:
${closingList}

Return JSON only, using this shape:
{
  "emotionalExperience": ${spec.includesEmotionalExperience ? '"..."' : '""'},
  "categories": [
${categoryJson}
  ],
  "closings": [
${closingJson}
  ]
}`;
}

const JESSICA_NEWBY: ContextAssessmentSpec = {
  scenarioId: "policymaker-jessica-newby",
  avatarName: "Representative Jessica Newby",
  projectTitle:
    "Public Health Communication Simulation – Legislative Testimony",
  roleSummary:
    "The learner was giving oral testimony to a Colorado State Representative and Chair of the Health and Human Services Committee. Evaluate how effectively they communicate, persuade, respond to criticism, address concerns, and engage with competing viewpoints. Do not evaluate whether their position is correct.",
  evaluatorVoice: "an experienced policymaker",
  categories: [
    {
      id: "content-credibility",
      title: "Content and Credibility",
      lookFors: [
        "Accuracy",
        "Use of evidence",
        "Credibility",
        "Persuasiveness",
        "Audience awareness",
        "Ability to acknowledge and address competing viewpoints",
        "Effectiveness in responding to constituent concerns",
      ],
    },
    {
      id: "clarity-organization",
      title: "Clarity and Organization",
      lookFors: [
        "Opening statement",
        "Logical structure",
        "Transitions",
        "Conciseness",
        "Conclusion",
        "Ability to keep complex information understandable",
        "Time management",
      ],
    },
    {
      id: "delivery-professionalism",
      title: "Delivery, Engagement, and Professionalism",
      lookFors: [
        "Professional presence",
        "Confidence",
        "Empathy",
        "Accessibility",
        "Connection with audience",
        "Handling of difficult questions",
        "Professionalism under scrutiny",
      ],
    },
    {
      id: "message-impact",
      title: "Message Impact and Effectiveness",
      lookFors: [
        "Strength of key message",
        "Memorability",
        "Call to action",
        "Ability to persuade",
        "Overall effectiveness",
        "Ability to influence policymaker decision-making",
      ],
    },
  ],
  closingPrompts: [
    {
      id: "most-persuasive",
      prompt: "What I found most persuasive was...",
    },
    {
      id: "remaining-question",
      prompt: "The question I still have after hearing your testimony is...",
    },
    {
      id: "single-improvement",
      prompt:
        "If you were presenting this testimony again tomorrow, the single improvement that would have the greatest impact would be...",
    },
  ],
};

const HENRY_HOOK: ContextAssessmentSpec = {
  scenarioId: "journalist-henry-hook",
  avatarName: "Henry Hook",
  projectTitle:
    "Public Health Communication Simulation – Engaging with the Media",
  roleSummary:
    "The learner was speaking with a national health and environmental journalist. Evaluate whether there is a story here, whether the learner is a credible expert source, whether they can explain complicated issues clearly, and whether the journalist would contact them again. Focus on both current story potential and long-term source value.",
  evaluatorVoice: "an experienced journalist",
  categories: [
    {
      id: "content-credibility",
      title: "Content and Credibility",
      lookFors: [
        "Accuracy",
        "Evidence",
        "Credibility",
        "Trustworthiness",
        "Expertise",
      ],
    },
    {
      id: "clarity-organization",
      title: "Clarity and Organization",
      lookFors: [
        "Structure",
        "Explanation",
        "Storytelling",
        "Use of plain language",
        "Ability to simplify complex ideas",
      ],
    },
    {
      id: "delivery-professionalism",
      title: "Delivery and Professionalism",
      lookFors: [
        "Confidence",
        "Professionalism",
        "Responsiveness",
        "Accessibility",
        "Interview presence",
      ],
    },
    {
      id: "message-impact",
      title: "Message Impact",
      lookFors: [
        "Newsworthiness",
        "Memorability",
        "Public relevance",
        "Potential audience interest",
      ],
    },
    {
      id: "source-value",
      title: "Source Value",
      lookFors: [
        "Whether you would contact this person again",
        "Whether you would trust them as an expert source",
        "Whether they made the story easy to understand",
        "Whether they would be useful for future reporting",
        "Whether they demonstrated long-term value as a professional contact",
      ],
    },
  ],
  closingPrompts: [
    {
      id: "interested-most",
      prompt: "What interested me most about this story was...",
    },
    {
      id: "unanswered-question",
      prompt:
        "The question I would still want answered before writing the story is...",
    },
    {
      id: "follow-up",
      prompt:
        "As a journalist, the reason I would or would not follow up on this story is...",
    },
    {
      id: "call-again",
      prompt:
        "If I were to call you again in the future, it would be because...",
    },
  ],
};

const JOANN_JACKSON: ContextAssessmentSpec = {
  scenarioId: "community-skeptical-joann-jackson",
  avatarName: "Joann Jackson",
  projectTitle:
    "Public Health Communication Simulation – Community Conversation",
  roleSummary:
    "The learner was talking with a skeptical, curious community member at a neighborhood block party. Evaluate whether they built trust, listened, showed respect, understood concerns, and left a positive relationship. The goal is not necessarily to change her mind.",
  evaluatorVoice: "a community member sharing how the conversation felt",
  includesEmotionalExperience: true,
  categories: [
    {
      id: "key-message",
      title: "Key Message",
      lookFors: ["Was the central message clear?", "Did it stay focused?"],
    },
    {
      id: "active-listening",
      title: "Active Listening",
      lookFors: [
        "Did the learner genuinely try to understand your concerns?",
        "Did they listen before trying to persuade?",
      ],
    },
    {
      id: "empathy-understanding",
      title: "Empathy and Understanding",
      lookFors: [
        "Did you feel respected?",
        "Did they understand your concerns?",
        "Did they find common ground?",
      ],
    },
    {
      id: "asking-questions",
      title: "Asking Questions",
      lookFors: [
        "Did the learner ask about your experiences, family, concerns, or beliefs?",
        "Did they show curiosity rather than lecturing?",
      ],
    },
    {
      id: "thinking-before-speaking",
      title: "Thinking Before Speaking",
      lookFors: [
        "Did they avoid making assumptions?",
        "Did they pause and respond thoughtfully?",
      ],
    },
    {
      id: "nonverbal-communication",
      title: "Awareness of Nonverbal Communication",
      lookFors: [
        "Did the conversation feel neighborly and comfortable?",
        "Did they avoid a lecturing or dismissive tone?",
      ],
    },
    {
      id: "clear-language",
      title: "Clear and Concise Language",
      lookFors: [
        "Did they avoid jargon?",
        "Did they use stories, examples, and plain language?",
      ],
    },
    {
      id: "content-credibility",
      title: "Content and Credibility",
      lookFors: [
        "Was the information believable?",
        "Did they explain ideas without overwhelming with statistics?",
      ],
    },
    {
      id: "clarity-organization",
      title: "Clarity and Organization",
      lookFors: [
        "Was the explanation easy to follow?",
        "Did they keep the conversation informal and understandable?",
      ],
    },
    {
      id: "delivery-professionalism",
      title: "Delivery, Engagement, and Professionalism",
      lookFors: [
        "Did they remain neighborly and respectful?",
        "Did they stay engaged without talking at you?",
      ],
    },
    {
      id: "message-impact",
      title: "Message Impact",
      lookFors: [
        "Would you be willing to have another conversation?",
        "Did you trust this person more than when you started?",
      ],
    },
  ],
  closingPrompts: [
    {
      id: "trusted-most",
      prompt: "The moment I trusted you the most was...",
    },
    {
      id: "pulling-away",
      prompt: "The moment I felt myself pulling away was...",
    },
    {
      id: "next-conversation",
      prompt:
        "If we were neighbors having another conversation next week, the one thing that would make me even more willing to listen would be...",
    },
  ],
};

const MICHELLE_SMITH: ContextAssessmentSpec = {
  scenarioId: "community-confrontational-michelle-smith",
  avatarName: "Michelle Smith",
  projectTitle: "Public Health Communication Simulation – Community Town Hall",
  roleSummary:
    "The learner was answering questions from a concerned, confrontational community member at a public town hall. Evaluate whether they listened, stayed calm, answered difficult questions honestly, acknowledged concerns, and demonstrated respect even when challenged. The goal is not necessarily to change her opinion.",
  evaluatorVoice:
    "a concerned community member sharing how the communication came across",
  includesEmotionalExperience: true,
  categories: [
    {
      id: "key-message",
      title: "Key Message",
      lookFors: ["Was the central message clear?", "Did it stay focused?"],
    },
    {
      id: "active-listening",
      title: "Active Listening",
      lookFors: [
        "Did the learner genuinely try to understand your concerns?",
        "Did they reflect back what they heard?",
      ],
    },
    {
      id: "showing-empathy",
      title: "Showing Empathy",
      lookFors: [
        "Did you feel respected?",
        "Did the learner acknowledge your emotions and perspective?",
      ],
    },
    {
      id: "asking-questions",
      title: "Asking Questions",
      lookFors: [
        "Did the learner ask meaningful questions instead of making assumptions?",
      ],
    },
    {
      id: "thinking-before-speaking",
      title: "Thinking Before Speaking",
      lookFors: [
        "Did the learner remain calm under pressure?",
        "Did they avoid becoming defensive?",
      ],
    },
    {
      id: "nonverbal-communication",
      title: "Nonverbal Communication",
      lookFors: [
        "Did the learner appear confident, respectful, and approachable?",
      ],
    },
    {
      id: "clear-language",
      title: "Clear Language",
      lookFors: [
        "Did they avoid jargon?",
        "Did they explain ideas understandably?",
      ],
    },
    {
      id: "content-credibility",
      title: "Content and Credibility",
      lookFors: [
        "Was the information believable?",
        "Did they explain evidence without overwhelming you?",
      ],
    },
    {
      id: "message-impact",
      title: "Message Impact",
      lookFors: [
        "Did you leave understanding the issue better?",
        "Would you be willing to continue the conversation in the future?",
      ],
    },
  ],
  closingPrompts: [
    {
      id: "started-trusting",
      prompt: "The moment I started trusting you was...",
    },
    {
      id: "most-defensive",
      prompt: "The moment I became most defensive was...",
    },
    {
      id: "unanswered-question",
      prompt: "The question I still don't feel was completely answered is...",
    },
    {
      id: "next-meeting",
      prompt:
        "If another community meeting were held next month, the one thing that would make me even more willing to listen would be...",
    },
  ],
};

const CONTEXT_ASSESSMENTS: Record<string, ContextAssessmentSpec> = {
  "policymaker-jessica-newby": JESSICA_NEWBY,
  "journalist-henry-hook": HENRY_HOOK,
  "community-skeptical-joann-jackson": JOANN_JACKSON,
  "community-confrontational-michelle-smith": MICHELLE_SMITH,
};

export function getContextAssessment(
  scenarioId: string,
): LoadedContextAssessment | undefined {
  const spec = CONTEXT_ASSESSMENTS[scenarioId];
  if (!spec) {
    return undefined;
  }

  return {
    ...spec,
    evaluatorPrompt: buildEvaluatorPrompt(spec),
  };
}
