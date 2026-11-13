import { PUBHEALTH_AVATARS } from "./pubhealthAvatars";

export const PRESENTATION_SCENARIOS = [
  {
    slug: "jessica",
    role: "Policymaker",
    audience: "Make the case for action",
    task: "Explain a public health issue you know and make a specific request to Representative Newby.",
    opening:
      "Thank you for meeting with me. I’d like to discuss a public health issue affecting your constituents.",
    watch: "Was the request clear and relevant to constituents?",
    skill: "Evidence · Relevance · A clear ask",
  },
  {
    slug: "henry",
    role: "Journalist",
    audience: "Make the evidence understandable",
    task: "Explain a public health issue you know and why it matters to a journalist’s audience.",
    opening:
      "There’s a public health story I’d like to share with you and your readers.",
    watch: "Was the main message understandable and memorable?",
    skill: "Plain language · Storytelling · Public relevance",
  },
  {
    slug: "joann",
    role: "Community member",
    audience: "Build trust through curiosity",
    task: "Explore Joann’s questions and concerns. Listen first, then discuss a public health issue in everyday language.",
    opening:
      "I’d like to understand your perspective. What concerns you most about this issue?",
    watch: "Did the participant listen before explaining?",
    skill: "Listening · Curiosity · Common ground",
  },
  {
    slug: "michelle",
    role: "Town hall participant",
    audience: "Keep a difficult conversation open",
    task: "Respond to Michelle’s strong concerns about public health. Acknowledge her perspective and keep the conversation constructive.",
    opening:
      "I want to hear what’s concerning you. What would you most like us to understand?",
    watch: "Did the participant acknowledge emotion and remain calm?",
    skill: "Empathy · Respect · Constructive dialogue",
  },
].map((scenario, index) => ({
  ...scenario,
  avatar: PUBHEALTH_AVATARS[index]!,
  number: index + 1,
}));

export const PUBLIC_EXPERIENCE_URL =
  "https://clint-avatar-pubhealth.vercel.app/";
