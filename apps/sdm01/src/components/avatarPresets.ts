export interface AvatarPreset {
  name: string;
  avatarId: string;
  contextId: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    name: "Aurora - DASH Introduction",
    avatarId: "9a4f4b1f-86f9-4acf-9a37-b81c21ae95e4",
    contextId: "78ce67ac-b883-4221-9c7d-f8f633514bf3",
  },
  {
    name: "John - Health Assessment",
    avatarId: "0930fd59-c8ad-434d-ad53-b391a1768720",
    contextId: "243f6564-cede-48ec-8596-21b3384aa8fd",
  },
  {
    name: "Jessica - PHQ2 Screening",
    avatarId: "073b60a9-89a8-45aa-8902-c358f64d2852",
    contextId: "570af2fa-b81c-4db4-abc9-b3b517740bba",
  },
  {
    name: "Greg - PHQ9 Screening",
    avatarId: "0930fd59-c8ad-434d-ad53-b391a1768720",
    contextId: "d568b5fd-ff39-4e4a-aa45-62d06812af0d",
  },
];
