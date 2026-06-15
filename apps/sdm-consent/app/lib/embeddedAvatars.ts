export type EmbeddedAvatarConfig = {
  name: string;
  embedId: string;
};

export const EMBEDDED_AVATARS: EmbeddedAvatarConfig[] = [
  {
    name: "George Whitman",
    embedId: "29c5223a-4bc0-4a01-9b76-0fda53a10b62",
  },
  {
    name: "Linda Whitman",
    embedId: "9a2f6a13-e8be-4039-9300-10b6c381f703",
  },
];

export const getEmbedUrl = (embedId: string) =>
  `https://embed.liveavatar.com/v1/${embedId}?orientation=horizontal`;
