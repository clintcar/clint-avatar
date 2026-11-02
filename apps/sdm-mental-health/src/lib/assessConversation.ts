import type { Patient } from "../../app/lib/patients";
import { MessageSender, type LiveAvatarSessionMessage } from "../liveavatar/types";

export type EvidenceScore = {
  title: string;
  score: number;
  max: number;
  rationale: string;
};
export type Assessment = {
  sections: EvidenceScore[];
  total: number;
  max: number;
  observations: { label: string; observed: boolean; evidence: string }[];
  caveat: string;
};

const PHQ_ITEMS: { label: string; patterns: RegExp[] }[] = [
  { label: "PHQ-2: little interest or pleasure", patterns: [/little (?:interest|pleasure)/i, /interest (?:or|in).*pleasure/i, /enjoy(?:ing)? (?:doing )?things/i] },
  { label: "PHQ-2: feeling down, depressed, or hopeless", patterns: [/down.{0,35}depress/i, /depress.{0,25}hopeless/i, /feeling (?:down|hopeless)/i] },
  { label: "PHQ-9 item 3: sleep", patterns: [/trouble (?:falling|staying) asleep/i, /sleep(?:ing)? (?:too much|problems|difficult)/i, /sleep.{0,25}(?:little|much|well)/i] },
  { label: "PHQ-9 item 4: fatigue", patterns: [/tired|little energy|fatigue|low energy/i] },
  { label: "PHQ-9 item 5: appetite", patterns: [/poor appetite|overeating|appetite|eating (?:too much|less)/i] },
  { label: "PHQ-9 item 6: self-worth", patterns: [/bad about yourself|failure|let (?:yourself|your family) down|worthless/i] },
  { label: "PHQ-9 item 7: concentration", patterns: [/trouble concentrating|concentrat|focus(?:ing)? on (?:things|reading)|watching television/i] },
  { label: "PHQ-9 item 8: movement or restlessness", patterns: [/moving or speaking slowly|moving.{0,30}slow|speaking.{0,30}slow|fidget|restless|moving around (?:a lot|more)/i] },
  { label: "PHQ-9 item 9: death or self-harm", patterns: [/better off dead|hurting yourself|harm(?:ing)? yourself|thoughts? of (?:death|suicide|self.harm)|kill yourself/i] },
];

const any = (turns: string[], patterns: RegExp[]) => turns.some(t => patterns.some(p => p.test(t)));
const followup = [/plan (?:to |for )?(?:hurt|harm|kill)/i, /intent(?:ion)? to (?:hurt|harm|kill)/i, /access to (?:weapons|guns|means)/i, /do you (?:feel safe|have a plan)/i, /immediate (?:danger|risk)/i, /are you safe/i, /how often.*(?:thoughts|suicid)/i, /have you (?:ever )?(?:attempted|tried)/i];

export function assessConversation(patient: Patient, messages: LiveAvatarSessionMessage[], notes: string): Assessment {
  const learnerTurns = messages.filter(m => m.sender === MessageSender.USER).map(m => m.message);
  // Assessment/debrief turns must not count as learner-administered screening.
  const cutoff = learnerTurns.findIndex(t => /(?:assess|evaluate|grade|score) (?:me|my performance)|(?:end|stop) (?:the )?(?:role.?play|simulation)/i.test(t));
  const clinicalTurns = cutoff < 0 ? learnerTurns : learnerTurns.slice(0, cutoff);
  const flags = PHQ_ITEMS.map(item => any(clinicalTurns, item.patterns));
  const firstTwo = Number(flags[0]) + Number(flags[1]);
  const additional = flags.slice(2).filter(Boolean).length;
  const suicideQuestion = flags[8];
  const safetyFollowup = any(clinicalTurns, followup);
  const referral = any(clinicalTurns, [/refer(?:ral)?/i, /behavioral health/i, /mental health (?:provider|specialist)/i, /primary care (?:doctor|provider|physician)/i]);
  const askedPHQ9 = additional > 0 || any(clinicalTurns, [/(?:administer|complete|take|do|ask|start|need).{0,35}phq.?9/i, /phq.?9.{0,30}(?:administer|complete|take|do|ask|start)/i]);
  const inappropriateReferral = patient.id === "jessica" && any(clinicalTurns, [/(?:need|require|recommend|should).{0,45}(?:refer|behavioral health referral|mental health referral)/i]);
  const explained = any(clinicalTurns, [/screen(?:ing)?/i, /(?:ask|questions).{0,45}(?:mood|mental health)/i, /(?:standard|routine).{0,30}questions/i]);
  const empathy = any(clinicalTurns, [/sorry/i, /understand/i, /that sounds/i, /thank you/i, /appreciate/i, /difficult/i, /concern/i]);
  const documentation = notes.toLowerCase();
  const hasScoreNote = /phq|score|screen/i.test(documentation);
  const hasPlanNote = /follow|plan|treatment|continue|dental/i.test(documentation);
  const hasReferralNote = /refer|primary care|behavioral health/i.test(documentation);
  const hasSIResponseNote = /suicid|self.harm|item 9|safety|ideation/i.test(documentation);
  const observations = PHQ_ITEMS.map((item, i) => ({
    label: item.label,
    observed: Boolean(flags[i]),
    evidence: clinicalTurns.find(t => item.patterns.some(p => p.test(t))) || "",
  }));
  let clinical: EvidenceScore;
  let documentationScore: number;
  let docReason: string;
  if (patient.id === "jessica") {
    if (askedPHQ9 || inappropriateReferral || firstTwo === 0) {
      clinical = {title:"Behavioral Health Screening and Clinical Judgement",score:0,max:4,rationale:askedPHQ9 ? "Critical error: PHQ-9 was initiated or recommended after Jessica's negative PHQ-2." : inappropriateReferral ? "Critical error: referral was recommended despite the negative screen." : "Critical error: PHQ-2 questions were not identified."};
    } else {
      clinical = {title:"Behavioral Health Screening and Clinical Judgement",score:firstTwo === 2 ? 4 : 2,max:4,rationale:firstTwo === 2 ? "Both PHQ-2 questions observed; no unnecessary PHQ-9 questions detected. Confirm the score and interpretation in the transcript." : "Only one of the two PHQ-2 questions was identified."};
    }
    documentationScore = !hasScoreNote ? 0 : hasPlanNote && /negative|no (?:phq.?9|referral)|not indicated/i.test(documentation) ? 3 : hasPlanNote ? 2 : 1;
    docReason = documentationScore === 0 ? "No PHQ-2 result was documented in the case notes." : "Provisional evidence from the case notes; verify negative-screen interpretation and dental plan.";
  } else {
    if (firstTwo === 0 || (suicideQuestion && !safetyFollowup)) {
      clinical = {title:"Behavioral Health Screening and Clinical Judgement",score:0,max:4,rationale:firstTwo === 0 ? "Critical error: PHQ-2 was not identified." : "Critical error: PHQ-9 self-harm item identified without further suicide-risk assessment."};
    } else {
      const complete = firstTwo === 2 && additional === 7;
      const score = complete && safetyFollowup && referral ? 4 : complete ? 3 : 2;
      clinical = {title:"Behavioral Health Screening and Clinical Judgement",score,max:4,rationale:`${firstTwo}/2 PHQ-2 questions and ${additional}/7 additional PHQ-9 questions identified; safety follow-up ${safetyFollowup ? "observed" : "not observed"}; referral discussion ${referral ? "observed" : "not observed"}.`};
    }
    documentationScore = !hasScoreNote && !hasReferralNote ? 0 : [hasScoreNote,hasReferralNote,hasSIResponseNote,hasPlanNote].filter(Boolean).length >= 4 ? 3 : [hasScoreNote,hasReferralNote,hasSIResponseNote,hasPlanNote].filter(Boolean).length >= 2 ? 2 : 1;
    docReason = "Provisional evidence from case notes; verify both screening scores, suicide-risk response, referral, and PCP follow-up.";
  }
  const communicationScore = !explained && !empathy ? 1 : explained && empathy ? 3 : 2;
  const sections: EvidenceScore[] = [
    clinical,
    {title:"Communication and Person-Centered Care",score:communicationScore,max:3,rationale:`Screening explanation ${explained ? "detected" : "not detected"}; supportive language ${empathy ? "detected" : "not detected"}. Tone and rapport need human review.`},
    {title:"Referral, Documentation and Case Management",score:documentationScore,max:3,rationale:docReason},
  ];
  return {sections,total:sections.reduce((sum,s)=>sum+s.score,0),max:10,observations,caveat:"Provisional automated score only. Phrase matching can miss paraphrases or misread context; faculty must verify the transcript, clinical sequencing, safety response, and case notes before using this as a grade."};
}
