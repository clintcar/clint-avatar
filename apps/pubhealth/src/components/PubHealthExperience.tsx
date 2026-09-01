"use client";

import { PUBHEALTH_AVATARS } from "../../app/lib/pubhealthAvatars";
import { PubHealthAvatarSection } from "./PubHealthAvatarSession";

export function PubHealthExperience() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 pb-10 flex flex-col gap-8">
      {PUBHEALTH_AVATARS.map((avatar) => (
        <PubHealthAvatarSection
          key={avatar.id}
          scenarioId={avatar.id}
          title={avatar.title}
          avatarId={avatar.avatarId}
          contextId={avatar.contextId}
          previewImage={avatar.previewImage}
        />
      ))}
    </div>
  );
}
