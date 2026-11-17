export type PubHealthAvatarConfig = {
  id: string;
  title: string;
  name: string;
  kicker: string;
  avatarId: string;
  contextId: string;
  previewImage: string;
  age: number;
  background: string;
  coreIssue: string;
  scenario: string;
};

export const PUBHEALTH_AVATARS: PubHealthAvatarConfig[] = [
  {
    id: "alex-involvement",
    name: "Alex Rivera",
    title: "Involvement — Alex Rivera",
    kicker: "Feedback practice · Involvement",
    avatarId: "05eee471-f9f7-481f-ada6-4e12b2ee0e6d",
    contextId: "12a506d7-f11e-4c13-acb6-3aa70388991e",
    previewImage:
      "/api/avatar-preview?avatar_id=05eee471-f9f7-481f-ada6-4e12b2ee0e6d",
    age: 25,
    background:
      "Second-year medical student transitioning into early clinical rotations. Strong academic performance.",
    coreIssue: "Showing up late/not following through (involvement lapse)",
    scenario:
      "You have worked with Alex for 2 months in clinic and will continue working with them for the rest of this year. You have a meeting scheduled to provide early feedback on their performance to help them improve for the rest of the rotation. You notice that Alex often arrives late to clinic – 10–15 minutes after the patient – and has not always reviewed the patients ahead of time. For them to see a patient you have to specifically prompt them to do it. When Alex does see patients, their information gathering and assessment and plan are quite thorough and appropriate. Alex asks good medical questions to you about some of their patients particularly those relevant to their specialty of interest. Last week Alex forgot to follow up on a lab result for a patient but then when you reminded them did follow up and had a very good conversation with the family explaining the results in a way that they could easily understand.",
  },
  {
    id: "morgan-introspection",
    name: "Morgan Zhang",
    title: "Introspection — Morgan Zhang",
    kicker: "Feedback practice · Introspection",
    avatarId: "87dff365-543d-46a5-9f5a-524da44675ab",
    contextId: "aab5ea07-2025-4605-98da-4e2816d170b0",
    previewImage:
      "/api/avatar-preview?avatar_id=87dff365-543d-46a5-9f5a-524da44675ab",
    age: 27,
    background:
      "Final-year medical student on last clinical rotation before graduation. Strong clinical skills, confident in readiness for residency, often disregards corrective guidance.",
    coreIssue: "Not responding to feedback (introspection lapse)",
    scenario:
      "You are working with Morgan on their last rotation before graduation and want to provide end of rotation feedback to them about their performance on the rotation during a brief meeting you just scheduled in the workroom at the end of the last day. You will likely not work with Morgan again. Over the rotation Morgan has done well clinically but has not always responded to feedback. For example, Morgan was told multiple times what the appropriate format for notes was and continued to keep the notes in the format that they liked. Another example includes that when provided feedback about how a conversation with a family went, they were defensive and blamed the situation rather than accepting the feedback.",
  },
  {
    id: "lina-integrity",
    name: "Lina Morales",
    title: "Integrity — Lina Morales",
    kicker: "Feedback practice · Integrity",
    avatarId: "3ccd1378-1126-4197-9fff-a607af83726a",
    contextId: "087c93e8-9e27-48d6-b541-bc47e6a8a613",
    previewImage:
      "/api/avatar-preview?avatar_id=3ccd1378-1126-4197-9fff-a607af83726a",
    age: 24,
    background:
      "End-of-year intern eager to pursue a competitive specialty. Wants to be seen as polished and competent but sometimes overstates or misrepresents information.",
    coreIssue: "Lying/not admitting that didn't do something (integrity)",
    scenario:
      'On rounds today, Lina presented that her patient had a normal CT scan when in fact the scanner had been broken overnight and had not yet been completed. When asked about this, she said that she had seen in the chart that the scan was negative and that there must be something wrong in the chart. There have been other smaller concerns while she has been on your service this month such as once when she said she had completed the discharge medications, but the pharmacy never received the orders or another time when she stated that the patient had an abnormal ear exam when an otoscope was not available. Based on the concerns in rounds you decide to talk with her about these concerns as you worry that her colleagues don\'t trust what she says and have heard rumblings from some of the residents that they think she is a "liar." You are especially worried about this integrity issue as Lina will be rotating on your service again and wants to pursue your specialty so you pull her aside before seeing the next patient.',
  },
  {
    id: "chris-interaction",
    name: "Chris Okafor",
    title: "Interaction — Chris Okafor",
    kicker: "Feedback practice · Interaction",
    avatarId: "01a97c47-56f7-4b0e-bf82-8449c02a5a71",
    contextId: "51b08ea3-6b5c-4c06-908c-d5434d5742e8",
    previewImage:
      "/api/avatar-preview?avatar_id=01a97c47-56f7-4b0e-bf82-8449c02a5a71",
    age: 24,
    background:
      "Third-year medical student in core clinical rotations. Strong in medical reasoning but less skilled at patient communication and noticing non-verbal cues.",
    coreIssue:
      "Difficulty with communication and interpersonal skills (interaction)",
    scenario:
      "You are working with Chris for the first time in an outpatient clinic and recently observed a visit in which he used a lot of closed ended questions to gather a history and did not realize that the patient's mother was crying during part of the visit. He was very focused on making sure he asked every review of systems question and didn't always attend to whether or not he was using language that someone outside of medicine could understand. After the visit you want to provide feedback with him on this interaction so that he can learn from it as you will be working together closely for the next month. In mentioning the interaction one-on-one with Chris, he is very focused on the medicine of the case and the fact that he was able to get to the correct diagnosis and doesn't seem to focus on the interaction with the family.",
  },
];
