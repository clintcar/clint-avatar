"use client";

import { PUBHEALTH_AVATARS } from "../../app/lib/pubhealthAvatars";
import { PubHealthAvatarSection } from "./PubHealthAvatarSession";

export function PubHealthExperience() {
  return (
    <div>
      <section className="bg-[linear-gradient(115deg,rgba(0,79,102,.98),rgba(0,106,134,.92))] text-white border-b-[7px] border-b-chwe-green">
        <div className="chwe-shell py-[52px] max-[800px]:py-10">
          <p className="m-0 mb-3.5 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-white/80">
            Interactive learning experience
          </p>
          <h1 className="m-0 mb-3.5 text-[clamp(2rem,4vw,3.15rem)] font-bold leading-[1.12] tracking-[-0.03em]">
            Live Avatar Conversations
          </h1>
          <p className="m-0 max-w-[46rem] text-[1.08rem] leading-[1.55] text-white/90">
            Practice conversations with policymakers, journalists, and community
            members.
          </p>
        </div>
      </section>

      <div className="chwe-shell py-[42px] pb-[70px] max-[800px]:py-8 max-[800px]:pb-[52px]">
        <p className="m-0 mb-2.5 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-chwe-green-dark">
          Four live conversations
        </p>
        <h2 className="m-0 mb-3.5 text-[1.7rem] font-bold leading-[1.2] tracking-[-0.02em] text-chwe-ink">
          Choose a scenario and begin
        </h2>
        <p className="m-0 mb-4 max-w-[46rem] text-[1.02rem] text-chwe-muted">
          Use the interactive avatar in each scenario to begin the conversation.
          Your browser may ask for microphone permission before the session
          starts.
        </p>
        <div className="mb-8 max-w-[46rem] border-l-[5px] border-l-chwe-green bg-chwe-soft px-[18px] py-3.5 text-[0.95rem]">
          <strong className="text-chwe-ink">Before you begin</strong>
          <p className="m-0 mt-1 text-chwe-muted">
            Find a quiet space and use headphones when possible for the best
            experience.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {PUBHEALTH_AVATARS.map((avatar) => (
            <PubHealthAvatarSection
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

        <div className="mt-10 bg-chwe-mist border-t-4 border-t-chwe-blue px-[22px] py-[18px] rounded-[4px]">
          <h3 className="m-0 mb-2 text-[1.05rem] font-bold text-chwe-ink">
            When you are finished
          </h3>
          <p className="m-0 text-[0.95rem] text-chwe-muted">
            When you are finished with the entire interaction, close this
            tab/window to return and to complete the post-experience survey.
          </p>
        </div>
      </div>
    </div>
  );
}
