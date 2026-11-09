export type PubHealthAvatarConfig = {
  id: string;
  title: string;
  name: string;
  kicker: string;
  intro: string;
  avatarId: string;
  contextId: string;
  previewImage: string;
};

export const PUBHEALTH_AVATARS: PubHealthAvatarConfig[] = [
  {
    id: "policymaker-jessica-newby",
    title: "Speaking with Policymakers - Representative Jessica Newby",
    name: "Jessica Newby",
    kicker: "Policymaker scenario",
    intro: "Practice a live conversation with Representative Jessica Newby.",
    avatarId: "a96238c3-21e9-4eca-b4ca-3e411e4e5b6d",
    contextId: "c6376529-37e9-46f2-8cff-9edca594f739",
    previewImage:
      "/api/avatar-preview?avatar_id=a96238c3-21e9-4eca-b4ca-3e411e4e5b6d",
  },
  {
    id: "journalist-henry-hook",
    title: "Speaking with Journalist - Henry Hook",
    name: "Henry Hook",
    kicker: "Journalist scenario",
    intro: "Practice a live conversation with journalist Henry Hook.",
    avatarId: "a217d7cc-425e-42a1-9de7-c19c22c621ac",
    contextId: "f1398d19-adfc-4271-897f-645e61df4247",
    previewImage:
      "/api/avatar-preview?avatar_id=a217d7cc-425e-42a1-9de7-c19c22c621ac",
  },
  {
    id: "community-skeptical-joann-jackson",
    title: "Speaking with Skeptical Curious Community member - Joann Jackson",
    name: "Joann Jackson",
    kicker: "Community conversation",
    intro: "Practice a live conversation with community member Joann Jackson.",
    avatarId: "5f3fbb4d-87d3-4d71-9c5e-7b3689be6939",
    contextId: "5a1499f2-afbe-4177-b1d9-7b16d97e142d",
    previewImage:
      "/api/avatar-preview?avatar_id=5f3fbb4d-87d3-4d71-9c5e-7b3689be6939",
  },
  {
    id: "community-confrontational-michelle-smith",
    title: "Speaking with Confrontational Community Member - Michelle Smith",
    name: "Michelle Smith",
    kicker: "Community town hall",
    intro: "Practice a live conversation with community member Michelle Smith.",
    avatarId: "29973c22-9f65-4701-b504-4399e00f60e9",
    contextId: "87694914-a546-4682-b5d5-c636ceefd2ef",
    previewImage:
      "/api/avatar-preview?avatar_id=29973c22-9f65-4701-b504-4399e00f60e9",
  },
];
