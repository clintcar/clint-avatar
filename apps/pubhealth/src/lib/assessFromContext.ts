import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import type { LoadedContextAssessment } from "../../app/lib/pubhealthContexts";
import type {
  AssessmentCategoryResult,
  AssessmentClosingResult,
  ContextRubricAssessment,
} from "./assessTranscript";

type Exchange = {
  question: string;
  answer: string;
};

type ConversationEvidence = {
  learnerTurns: string[];
  avatarTurns: string[];
  firstLearner: string;
  lastLearner: string;
  learnerQuestions: string[];
  exchanges: Exchange[];
  unansweredQuestions: string[];
  longestLearner: string;
};

function excerpt(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return "";
  }
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max).trim()}...`;
}

function quote(speaker: string, text: string) {
  return `${speaker}: "${excerpt(text)}"`;
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function matchingTurns(turns: string[], terms: string[]) {
  return turns.filter((turn) => includesAny(turn, terms));
}

function collectEvidence(
  messages: LiveAvatarSessionMessage[],
): ConversationEvidence {
  const learnerTurns: string[] = [];
  const avatarTurns: string[] = [];
  const exchanges: Exchange[] = [];
  const unansweredQuestions: string[] = [];

  messages.forEach((message, index) => {
    if (message.sender === MessageSender.USER) {
      learnerTurns.push(message.message);
      return;
    }

    avatarTurns.push(message.message);
    if (!message.message.includes("?")) {
      return;
    }

    const answer = messages
      .slice(index + 1)
      .find((item) => item.sender === MessageSender.USER)?.message;

    if (answer) {
      exchanges.push({ question: message.message, answer });
    } else {
      unansweredQuestions.push(message.message);
    }
  });

  return {
    learnerTurns,
    avatarTurns,
    firstLearner: learnerTurns[0] ?? "",
    lastLearner: learnerTurns[learnerTurns.length - 1] ?? "",
    learnerQuestions: learnerTurns.filter((turn) => turn.includes("?")),
    exchanges,
    unansweredQuestions,
    longestLearner:
      [...learnerTurns].sort((a, b) => b.length - a.length)[0] ?? "",
  };
}

type LookForSignals = {
  listening: boolean;
  evidence: boolean;
  questions: boolean;
  empathy: boolean;
  jargon: boolean;
  story: boolean;
  challenge: boolean;
  nextSteps: boolean;
  opening: boolean;
  keyMessage: boolean;
  credibility: boolean;
  sourceValue: boolean;
  nonverbal: boolean;
  composure: boolean;
  competingViews: boolean;
};

function signalsFromLookFor(lookFor: string): LookForSignals {
  const text = lookFor.toLowerCase();
  return {
    listening: /listen|hear what|reflect|understand your|genuinely try/.test(
      text,
    ),
    evidence:
      /evidence|accuracy|data|finding|limitation|believable|scientific/.test(
        text,
      ),
    questions: /ask(ing)? question|curiosity|assumptions/.test(text),
    empathy: /empathy|respect|emotion|concern|family|common ground|care/.test(
      text,
    ),
    jargon:
      /plain language|jargon|simplif|accessible|understandable|everyday|concise/.test(
        text,
      ),
    story: /story|human|people|narrative|personal/.test(text),
    challenge:
      /difficult|scrutiny|defensive|pressure|interrupt|challenge|confront/.test(
        text,
      ),
    nextSteps:
      /call to action|follow up|contact again|future|another conversation|next week|next month|call you again/.test(
        text,
      ),
    opening: /opening|structure|organization|transition|conclusion/.test(text),
    keyMessage:
      /key message|central message|memorable|takeaway|focused|newsworth/.test(
        text,
      ),
    credibility: /credib|trustworth|expertise|trust this person/.test(text),
    sourceValue:
      /contact this person again|expert source|future reporting|long-term|collaborat/.test(
        text,
      ),
    nonverbal: /nonverbal|presence|approachable|body language|tone/.test(text),
    composure: /calm|defensive|pressure|thinking before/.test(text),
    competingViews:
      /competing|counter|constituent|disagree|skepti|criticism/.test(text),
  };
}

const EVIDENCE_TERMS = [
  "evidence",
  "research",
  "study",
  "data",
  "findings",
  "percent",
  "%",
  "cdc",
  "niosh",
  "limitation",
  "confident",
];
const EMPATHY_TERMS = [
  "understand",
  "hear",
  "concern",
  "thank",
  "appreciate",
  "family",
  "valid",
  "worry",
  "makes sense",
];
const STORY_TERMS = [
  "story",
  "patient",
  "family",
  "neighbor",
  "worker",
  "community",
  "example",
  "person",
];
const NEXT_STEP_TERMS = [
  "follow up",
  "follow-up",
  "next",
  "send",
  "contact",
  "stay in touch",
  "keep me posted",
  "call",
  "meeting",
];
const JARGON_TERMS = [
  "epidemiolog",
  "morbidity",
  "etiology",
  "comorbidity",
  "incidence",
  "prevalence",
  "statistically significant",
];

function evaluateLookFor(
  lookFor: string,
  evidence: ConversationEvidence,
  avatarName: string,
) {
  const signals = signalsFromLookFor(lookFor);
  const learnerHits = [
    signals.evidence
      ? matchingTurns(evidence.learnerTurns, EVIDENCE_TERMS)
      : [],
    signals.empathy ? matchingTurns(evidence.learnerTurns, EMPATHY_TERMS) : [],
    signals.story ? matchingTurns(evidence.learnerTurns, STORY_TERMS) : [],
    signals.nextSteps
      ? matchingTurns(evidence.learnerTurns, NEXT_STEP_TERMS)
      : [],
  ].flat();

  const askedQuestions =
    signals.questions && evidence.learnerQuestions.length > 0;
  const answeredChallenge =
    (signals.challenge || signals.competingViews) &&
    evidence.exchanges.length > 0;
  const hasOpening = signals.opening && Boolean(evidence.firstLearner);
  const hasKeyMessage =
    signals.keyMessage && evidence.longestLearner.length > 40;
  const listening =
    signals.listening &&
    (evidence.learnerQuestions.length > 0 || evidence.exchanges.length > 0);
  const composure =
    signals.composure &&
    evidence.exchanges.some((item) => item.answer.length > 40);
  const sourceValue =
    signals.sourceValue &&
    evidence.learnerTurns.length >= 2 &&
    evidence.longestLearner.length > 40;
  const jargonTurns = matchingTurns(evidence.learnerTurns, JARGON_TERMS);

  const jargonTurn = jargonTurns[0];
  if (signals.jargon && jargonTurn) {
    return {
      demonstrated: false,
      strength: "",
      improvement: `Context look-for: "${lookFor}" The learner used technical language that the Context asks to avoid: "${excerpt(jargonTurn)}"`,
      example: quote("Learner", jargonTurn),
    };
  }

  const demonstrated =
    learnerHits.length > 0 ||
    askedQuestions ||
    answeredChallenge ||
    hasOpening ||
    hasKeyMessage ||
    listening ||
    composure ||
    sourceValue ||
    (signals.jargon && Boolean(evidence.longestLearner));

  const exampleTurn =
    learnerHits[0] ||
    evidence.learnerQuestions[0] ||
    evidence.exchanges[0]?.answer ||
    evidence.longestLearner;

  const exampleQuestion = evidence.exchanges[0]?.question;

  const strength = demonstrated
    ? `Context look-for: "${lookFor}" This showed up in the conversation when the learner said, "${excerpt(exampleTurn)}"`
    : "";

  const improvement = demonstrated
    ? ""
    : exampleQuestion
      ? `Context look-for: "${lookFor}" This was not clearly shown. After ${avatarName} asked, "${excerpt(exampleQuestion)}" the learner's reply did not address that look-for.`
      : `Context look-for: "${lookFor}" This was not clearly demonstrated in the learner's turns.`;

  const example = exampleTurn
    ? exampleQuestion
      ? `${avatarName} asked, "${excerpt(exampleQuestion)}" The learner answered, "${excerpt(exampleTurn)}"`
      : quote("Learner", exampleTurn)
    : "";

  return { demonstrated, strength, improvement, example };
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function closingFromEvidence(
  promptId: string,
  evidence: ConversationEvidence,
  avatarName: string,
  weakestLookFor: string,
) {
  const exchange = evidence.exchanges[0];
  const lastExchange = evidence.exchanges[evidence.exchanges.length - 1];

  switch (promptId) {
    case "most-persuasive":
    case "interested-most":
    case "trusted-most":
    case "started-trusting":
    case "call-again":
      return evidence.longestLearner
        ? `The strongest learner turn in this conversation was: "${excerpt(evidence.longestLearner, 240)}"`
        : "The conversation did not include a fully developed learner statement to point to.";
    case "remaining-question":
    case "unanswered-question":
      return evidence.unansweredQuestions[0] || lastExchange?.question
        ? `${avatarName} still had this on the table: "${excerpt(evidence.unansweredQuestions[0] || lastExchange?.question || "")}"`
        : "No unanswered question from the avatar remained at the end of the transcript.";
    case "single-improvement":
    case "next-conversation":
    case "next-meeting":
      return weakestLookFor
        ? `Return to this Context look-for next time: "${weakestLookFor}"`
        : "Build a clearer response to the last question that was asked.";
    case "follow-up":
      return evidence.learnerTurns.length >= 3 &&
        evidence.longestLearner.length > 50
        ? "The transcript shows enough detail and back-and-forth that a journalist could reasonably follow up."
        : "The transcript does not yet show enough clarity or completeness for a confident follow-up.";
    case "pulling-away":
    case "most-defensive":
      return exchange
        ? `A pressure point in the conversation was when ${avatarName} asked, "${excerpt(exchange.question)}" and the learner answered, "${excerpt(exchange.answer)}"`
        : "No clear moment of pushback was captured in the transcript.";
    default:
      return evidence.lastLearner
        ? `The conversation ended with the learner saying, "${excerpt(evidence.lastLearner)}"`
        : "The transcript does not include a closing learner statement.";
  }
}

export function assessConversationAgainstContext(
  spec: LoadedContextAssessment,
  messages: LiveAvatarSessionMessage[],
): ContextRubricAssessment {
  const evidence = collectEvidence(messages);
  const weakestLookFors: string[] = [];

  const categories: AssessmentCategoryResult[] = spec.categories.map(
    (category) => {
      const notes = category.lookFors.map((lookFor) =>
        evaluateLookFor(lookFor, evidence, spec.avatarName),
      );
      const strengths = unique(notes.map((note) => note.strength)).slice(0, 3);
      const improvements = unique(notes.map((note) => note.improvement)).slice(
        0,
        3,
      );
      const examples = unique(notes.map((note) => note.example)).slice(0, 3);
      weakestLookFors.push(
        ...category.lookFors.filter((_, index) => !notes[index]?.demonstrated),
      );

      return {
        id: category.id,
        title: category.title,
        lookFors: category.lookFors,
        strengths,
        improvements,
        examples,
      };
    },
  );

  const closings: AssessmentClosingResult[] = spec.closingPrompts.map(
    (prompt) => ({
      id: prompt.id,
      prompt: prompt.prompt,
      text: closingFromEvidence(
        prompt.id,
        evidence,
        spec.avatarName,
        weakestLookFors[0] ?? "",
      ),
    }),
  );

  const firstLearnerQuestion = evidence.learnerQuestions[0];
  const emotionalExperience = spec.includesEmotionalExperience
    ? [
        firstLearnerQuestion
          ? `The conversation included learner questions such as "${excerpt(firstLearnerQuestion)}", which the Context treats as a trust-building move.`
          : `The learner did not ask ${spec.avatarName} a question, which the Context treats as a missed chance to listen first.`,
        evidence.exchanges[0]
          ? `A key back-and-forth was ${spec.avatarName} asking "${excerpt(evidence.exchanges[0].question)}" and the learner answering "${excerpt(evidence.exchanges[0].answer)}".`
          : `${spec.avatarName}'s questions were not clearly answered in the captured transcript.`,
      ].join(" ")
    : "";

  return {
    scenarioId: spec.scenarioId,
    avatarName: spec.avatarName,
    projectTitle: spec.projectTitle,
    generatedAt: new Date().toISOString(),
    emotionalExperience,
    categories,
    closings,
    source: "context-rubric",
  };
}
