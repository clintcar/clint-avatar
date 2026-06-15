"use client";

import { EMBEDDED_AVATARS } from "../../app/lib/embeddedAvatars";
import { ClinicalDashboard } from "./ClinicalDashboard";
import { EmbeddedAvatar } from "./EmbeddedAvatar";

export function SdmConsentExperience() {
  return (
    <div className="w-full max-w-[1700px] mx-auto px-2 xl:px-4 pb-8">
      <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.95fr)] gap-6 items-start">
        <div className="w-full min-w-0 flex flex-col gap-6">
          {EMBEDDED_AVATARS.map((avatar) => (
            <EmbeddedAvatar
              key={avatar.embedId}
              name={avatar.name}
              embedId={avatar.embedId}
            />
          ))}
        </div>
        <div className="w-full xl:sticky xl:top-4 flex flex-col gap-3">
          <ClinicalDashboard isSessionActive chatMessages={[]} />
          <div className="flex flex-row justify-end items-center gap-3 px-1">
            <a
              href="https://www.linkedin.com/in/clintcarlson/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-zinc-900 text-sm font-medium transition-colors"
            >
              Director: Clint Carlson
            </a>
            <span className="text-zinc-700 text-sm">|</span>
            <a
              href="https://www.linkedin.com/in/clintcarlson/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-zinc-900 text-sm font-medium transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
