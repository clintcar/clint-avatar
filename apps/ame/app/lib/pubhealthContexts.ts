export type ContextAssessmentCategory={id:string;title:string;lookFors:string[]};
export type ContextClosingPrompt={id:string;prompt:string};
export type ContextAssessmentSpec={scenarioId:string;avatarName:string;projectTitle:string;roleSummary:string;evaluatorVoice:string;categories:ContextAssessmentCategory[];closingPrompts:ContextClosingPrompt[]};
export type LoadedContextAssessment=ContextAssessmentSpec&{evaluatorPrompt:string};
const categories:ContextAssessmentCategory[]=[
  {
    "id": "learner-reflection",
    "title": "Offering learner opportunity to reflect before feedback",
    "lookFors": [
      "Invite the learner to self-assess before delivering judgments",
      "Ask what went well or what they would change"
    ]
  },
  {
    "id": "respect",
    "title": "Maintaining a respectful manner",
    "lookFors": [
      "Stay nonjudgmental and preserve dignity",
      "Address concerns without shaming"
    ]
  },
  {
    "id": "communication-style",
    "title": "Using an appropriate communication style",
    "lookFors": [
      "Adapt approach to learner and situation",
      "Use clear, collaborative language and listen"
    ]
  },
  {
    "id": "specific-behavior",
    "title": "Focusing on specific behavior",
    "lookFors": [
      "Describe directly observed actions rather than personality",
      "Use concrete examples"
    ]
  },
  {
    "id": "constructive",
    "title": "Giving constructive feedback",
    "lookFors": [
      "Balance actionable strengths and improvements",
      "Explain consequences and alternatives"
    ]
  },
  {
    "id": "action-plan",
    "title": "Ending with an action plan",
    "lookFors": [
      "Agree on concrete next steps",
      "Identify follow-up or practice"
    ]
  },
  {
    "id": "manageable-points",
    "title": "Limiting feedback to manageable points",
    "lookFors": [
      "Prioritize one or two actionable themes",
      "Avoid overwhelming the learner"
    ]
  },
  {
    "id": "appropriate-time",
    "title": "Allotting appropriate time",
    "lookFors": [
      "Allow learner response and discussion",
      "Avoid rushed or prolonged unfocused feedback; transcript timestamps can help but cannot establish all timing"
    ]
  },
  {
    "id": "verify-understanding",
    "title": "Verifying understanding",
    "lookFors": [
      "Ask learner to restate key points or next steps",
      "Check understanding rather than assume agreement"
    ]
  }
];
const specs:Record<string,ContextAssessmentSpec>=Object.fromEntries([
  [
    "alex-involvement",
    {
      "scenarioId": "alex-involvement",
      "avatarName": "Alex Rivera",
      "projectTitle": "Academy of Medical Educators — Feedback Skills Practice",
      "roleSummary": "Alex is a second-year medical student who is friendly and confident, but often late, underprepared and misses lab follow-up.",
      "evaluatorVoice": "a skilled clinical educator",
      "categories": [
        {
          "id": "learner-reflection",
          "title": "Offering learner opportunity to reflect before feedback",
          "lookFors": [
            "Invite the learner to self-assess before delivering judgments",
            "Ask what went well or what they would change"
          ]
        },
        {
          "id": "respect",
          "title": "Maintaining a respectful manner",
          "lookFors": [
            "Stay nonjudgmental and preserve dignity",
            "Address concerns without shaming"
          ]
        },
        {
          "id": "communication-style",
          "title": "Using an appropriate communication style",
          "lookFors": [
            "Adapt approach to learner and situation",
            "Use clear, collaborative language and listen"
          ]
        },
        {
          "id": "specific-behavior",
          "title": "Focusing on specific behavior",
          "lookFors": [
            "Describe directly observed actions rather than personality",
            "Use concrete examples"
          ]
        },
        {
          "id": "constructive",
          "title": "Giving constructive feedback",
          "lookFors": [
            "Balance actionable strengths and improvements",
            "Explain consequences and alternatives"
          ]
        },
        {
          "id": "action-plan",
          "title": "Ending with an action plan",
          "lookFors": [
            "Agree on concrete next steps",
            "Identify follow-up or practice"
          ]
        },
        {
          "id": "manageable-points",
          "title": "Limiting feedback to manageable points",
          "lookFors": [
            "Prioritize one or two actionable themes",
            "Avoid overwhelming the learner"
          ]
        },
        {
          "id": "appropriate-time",
          "title": "Allotting appropriate time",
          "lookFors": [
            "Allow learner response and discussion",
            "Avoid rushed or prolonged unfocused feedback; transcript timestamps can help but cannot establish all timing"
          ]
        },
        {
          "id": "verify-understanding",
          "title": "Verifying understanding",
          "lookFors": [
            "Ask learner to restate key points or next steps",
            "Check understanding rather than assume agreement"
          ]
        }
      ],
      "closingPrompts": []
    }
  ],
  [
    "morgan-introspection",
    {
      "scenarioId": "morgan-introspection",
      "avatarName": "Morgan Zhang",
      "projectTitle": "Academy of Medical Educators — Feedback Skills Practice",
      "roleSummary": "Morgan is a final-year medical student who defends their note format and rationalizes a difficult family interaction.",
      "evaluatorVoice": "a skilled clinical educator",
      "categories": [
        {
          "id": "learner-reflection",
          "title": "Offering learner opportunity to reflect before feedback",
          "lookFors": [
            "Invite the learner to self-assess before delivering judgments",
            "Ask what went well or what they would change"
          ]
        },
        {
          "id": "respect",
          "title": "Maintaining a respectful manner",
          "lookFors": [
            "Stay nonjudgmental and preserve dignity",
            "Address concerns without shaming"
          ]
        },
        {
          "id": "communication-style",
          "title": "Using an appropriate communication style",
          "lookFors": [
            "Adapt approach to learner and situation",
            "Use clear, collaborative language and listen"
          ]
        },
        {
          "id": "specific-behavior",
          "title": "Focusing on specific behavior",
          "lookFors": [
            "Describe directly observed actions rather than personality",
            "Use concrete examples"
          ]
        },
        {
          "id": "constructive",
          "title": "Giving constructive feedback",
          "lookFors": [
            "Balance actionable strengths and improvements",
            "Explain consequences and alternatives"
          ]
        },
        {
          "id": "action-plan",
          "title": "Ending with an action plan",
          "lookFors": [
            "Agree on concrete next steps",
            "Identify follow-up or practice"
          ]
        },
        {
          "id": "manageable-points",
          "title": "Limiting feedback to manageable points",
          "lookFors": [
            "Prioritize one or two actionable themes",
            "Avoid overwhelming the learner"
          ]
        },
        {
          "id": "appropriate-time",
          "title": "Allotting appropriate time",
          "lookFors": [
            "Allow learner response and discussion",
            "Avoid rushed or prolonged unfocused feedback; transcript timestamps can help but cannot establish all timing"
          ]
        },
        {
          "id": "verify-understanding",
          "title": "Verifying understanding",
          "lookFors": [
            "Ask learner to restate key points or next steps",
            "Check understanding rather than assume agreement"
          ]
        }
      ],
      "closingPrompts": []
    }
  ],
  [
    "lina-integrity",
    {
      "scenarioId": "lina-integrity",
      "avatarName": "Lina Morales",
      "projectTitle": "Academy of Medical Educators — Feedback Skills Practice",
      "roleSummary": "Lina is a first-year intern who claimed a CT was normal though no scan occurred, following other documentation discrepancies.",
      "evaluatorVoice": "a skilled clinical educator",
      "categories": [
        {
          "id": "learner-reflection",
          "title": "Offering learner opportunity to reflect before feedback",
          "lookFors": [
            "Invite the learner to self-assess before delivering judgments",
            "Ask what went well or what they would change"
          ]
        },
        {
          "id": "respect",
          "title": "Maintaining a respectful manner",
          "lookFors": [
            "Stay nonjudgmental and preserve dignity",
            "Address concerns without shaming"
          ]
        },
        {
          "id": "communication-style",
          "title": "Using an appropriate communication style",
          "lookFors": [
            "Adapt approach to learner and situation",
            "Use clear, collaborative language and listen"
          ]
        },
        {
          "id": "specific-behavior",
          "title": "Focusing on specific behavior",
          "lookFors": [
            "Describe directly observed actions rather than personality",
            "Use concrete examples"
          ]
        },
        {
          "id": "constructive",
          "title": "Giving constructive feedback",
          "lookFors": [
            "Balance actionable strengths and improvements",
            "Explain consequences and alternatives"
          ]
        },
        {
          "id": "action-plan",
          "title": "Ending with an action plan",
          "lookFors": [
            "Agree on concrete next steps",
            "Identify follow-up or practice"
          ]
        },
        {
          "id": "manageable-points",
          "title": "Limiting feedback to manageable points",
          "lookFors": [
            "Prioritize one or two actionable themes",
            "Avoid overwhelming the learner"
          ]
        },
        {
          "id": "appropriate-time",
          "title": "Allotting appropriate time",
          "lookFors": [
            "Allow learner response and discussion",
            "Avoid rushed or prolonged unfocused feedback; transcript timestamps can help but cannot establish all timing"
          ]
        },
        {
          "id": "verify-understanding",
          "title": "Verifying understanding",
          "lookFors": [
            "Ask learner to restate key points or next steps",
            "Check understanding rather than assume agreement"
          ]
        }
      ],
      "closingPrompts": []
    }
  ],
  [
    "chris-interaction",
    {
      "scenarioId": "chris-interaction",
      "avatarName": "Chris Okafor",
      "projectTitle": "Academy of Medical Educators — Feedback Skills Practice",
      "roleSummary": "Chris is a third-year student who diagnosed correctly but missed emotional cues, used closed questions and medical jargon.",
      "evaluatorVoice": "a skilled clinical educator",
      "categories": [
        {
          "id": "learner-reflection",
          "title": "Offering learner opportunity to reflect before feedback",
          "lookFors": [
            "Invite the learner to self-assess before delivering judgments",
            "Ask what went well or what they would change"
          ]
        },
        {
          "id": "respect",
          "title": "Maintaining a respectful manner",
          "lookFors": [
            "Stay nonjudgmental and preserve dignity",
            "Address concerns without shaming"
          ]
        },
        {
          "id": "communication-style",
          "title": "Using an appropriate communication style",
          "lookFors": [
            "Adapt approach to learner and situation",
            "Use clear, collaborative language and listen"
          ]
        },
        {
          "id": "specific-behavior",
          "title": "Focusing on specific behavior",
          "lookFors": [
            "Describe directly observed actions rather than personality",
            "Use concrete examples"
          ]
        },
        {
          "id": "constructive",
          "title": "Giving constructive feedback",
          "lookFors": [
            "Balance actionable strengths and improvements",
            "Explain consequences and alternatives"
          ]
        },
        {
          "id": "action-plan",
          "title": "Ending with an action plan",
          "lookFors": [
            "Agree on concrete next steps",
            "Identify follow-up or practice"
          ]
        },
        {
          "id": "manageable-points",
          "title": "Limiting feedback to manageable points",
          "lookFors": [
            "Prioritize one or two actionable themes",
            "Avoid overwhelming the learner"
          ]
        },
        {
          "id": "appropriate-time",
          "title": "Allotting appropriate time",
          "lookFors": [
            "Allow learner response and discussion",
            "Avoid rushed or prolonged unfocused feedback; transcript timestamps can help but cannot establish all timing"
          ]
        },
        {
          "id": "verify-understanding",
          "title": "Verifying understanding",
          "lookFors": [
            "Ask learner to restate key points or next steps",
            "Check understanding rather than assume agreement"
          ]
        }
      ],
      "closingPrompts": []
    }
  ]
]);
export function getContextAssessment(id:string):LoadedContextAssessment|undefined {const s=specs[id];return s?{...s,evaluatorPrompt:"Evaluate the faculty educator using only these nine AME feedback categories. Scores: 1 not done; 2 attempted but needs refinement; 3 successfully done. Only actual educator speech counts. Quote exact faculty statements. This is formative coaching."}:undefined;}
