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
          background and scenario, then select{" "}
          <strong>Start Conversation</strong> to begin.
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
            avatarId={avatar.avatarId}
            contextId={avatar.contextId}
            previewImage={avatar.previewImage}
          >
            <div className="mx-6 mt-5 space-y-3 max-[680px]:mx-4">
              <dl className="flex flex-wrap gap-2.5 text-sm">
                <div className="border-l-[3px] border-ame-gold bg-ame-mist px-3 py-2">
                  <dt className="inline font-bold">Age:</dt>{" "}
                  <dd className="inline">{avatar.age}</dd>
                </div>
                <div className="border-l-[3px] border-ame-gold bg-ame-mist px-3 py-2">
                  <dt className="inline font-bold">Background:</dt>{" "}
                  <dd className="inline">{avatar.background}</dd>
                </div>
              </dl>
              <p>
                <strong>Core Issue:</strong> {avatar.coreIssue}
              </p>
              <p>
                <strong>Scenario:</strong> {avatar.scenario}
              </p>
            </div>
          </AMEAvatarSection>
        ))}
      </div>
    </div>
  );
}
