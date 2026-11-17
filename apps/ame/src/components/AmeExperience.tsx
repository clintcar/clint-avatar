import { PUBHEALTH_AVATARS } from "../../app/lib/pubhealthAvatars";
import { AMEAvatarSection } from "./PubHealthAvatarSession";

export function AmeExperience() {
  return (
    <div className="ame-shell py-9">
      <section
        aria-labelledby="practice-heading"
        className="mb-[30px] max-w-[880px]"
      >
        <h2
          id="practice-heading"
          className="mb-2.5 text-[29px] font-bold leading-tight max-[680px]:text-[25px]"
        >
          Practice Feedback Conversations
        </h2>
        <p className="text-[#444]">
          Explore four clinical teaching scenarios and practice providing
          feedback with an interactive AI avatar. Review the learner’s
          background, then select <strong>Start Conversation</strong> to begin.
        </p>
      </section>

      <div className="flex flex-col gap-[30px]">
        {PUBHEALTH_AVATARS.map((avatar) => (
          <AMEAvatarSection
            key={avatar.id}
            scenarioId={avatar.id}
            title={avatar.title}
            name={avatar.name}
            kicker={avatar.kicker}
            intro={avatar.intro}
            avatarId={avatar.avatarId}
            contextId={avatar.contextId}
            previewImage={avatar.previewImage}
          />
        ))}
      </div>
    </div>
  );
}
