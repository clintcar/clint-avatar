export const RUBRIC = [
  { title: "Evidence-Based MicroTeach", levels: [
    ["3 · Excellent", "Multiple citations with substantive discussion of the literature."],
    ["2 · Met Expectations", "Relevant citations support the presentation."],
    ["0 · Critical Error", "No evidence of supporting literature."]
  ] },
  { title: "Content Delivery", levels: [
    ["3 · Excellent", "Valuable, organized, engaging, memorable or meaningful delivery."],
    ["2 · Met Expectations", "Necessary content delivered in an acceptable format."],
    ["0 · Critical Error", "Unclear, low-value, or poorly organized presentation."]
  ] },
  { title: "Student Interaction", levels: [
    ["3 · Excellent", "Excels at learner engagement and intellectual connection."],
    ["2 · Met Expectations", "Engages learners while delivering content."],
    ["0 · Critical Error", "Fails to engage learners."]
  ] },
  { title: "Engagement in Learning & Peer Support", levels: [
    ["3 · Excellent", "Verified attendance and peer support in all required sessions."],
    ["2 · Met Expectations", "At least 6/8 learning sessions and 4/5 MicroTeach sessions."],
    ["0 · Critical Error", "Below those participation thresholds."]
  ] }
] as const;
