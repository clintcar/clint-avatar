"use client";

import { useState } from "react";
import { SCENARIO_ID } from "../../app/lib/rubric";
import { IpcpAvatarSection } from "./IpcpAvatarSession";

export function IpcpExperience() {
  const [showPatient, setShowPatient] = useState(false);
  const [handoffActive, setHandoffActive] = useState(false);

  return (
    <>
      <header className="border-b-[6px] border-[#cfb87c] bg-[#171717] text-white">
        <div className="chwe-shell py-11 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#cfb87c]">
            CU Anschutz Medical Campus
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Interprofessional SBAR Handoff
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85">
            Practice a physical therapist’s handoff to a receiving clinician at DAWN Clinic.
          </p>
        </div>
      </header>
      <div className="chwe-shell space-y-7 py-8 sm:py-10">
        <div className="flex flex-wrap gap-2" aria-label="Choose practice or patient reference">
          <button type="button" onClick={() => setShowPatient(false)} aria-pressed={!showPatient} className="rounded border border-chwe-line px-4 py-2 text-sm font-bold aria-pressed:bg-[#171717] aria-pressed:text-white">
            Dr. Williams · SBAR Handoff
          </button>
          <button type="button" onClick={() => setShowPatient(true)} disabled={handoffActive} aria-pressed={showPatient} className="rounded border border-chwe-line px-4 py-2 text-sm font-bold aria-pressed:bg-[#171717] aria-pressed:text-white disabled:cursor-not-allowed disabled:opacity-55">
            Sal · Patient Reference
          </button>
        </div>
        <div hidden={showPatient}>
        <IpcpAvatarSection
          scenarioId={SCENARIO_ID}
          title="IPCP Module 2 · Part 1"
          name="Meet Dr. Sherly Williams"
          kicker="Handoff practice"
          onActiveChange={setHandoffActive}
          intro="You are the physical therapist calling from Sal Rodriguez’s home. Sal has experienced elevated blood pressure, headaches and dizziness during upright activities. Give Dr. Williams a concise I-SBAR handoff and confirm the next steps."
        />
        </div>
        {showPatient && (
          <section aria-labelledby="patient-title" className="rounded border border-chwe-line p-5">
            <h2 id="patient-title" className="text-xl font-bold">Meet Sal Rodriguez</h2>
            <p className="mb-4 mt-2 text-sm text-chwe-muted">Explore Sal’s experience and communication needs before practicing the clinician handoff. Return to Dr. Williams for the formative assessment.</p>
            <iframe
              src="https://embed.liveavatar.com/v1/2d92c830-e99b-46e3-8c64-08de3358b0a0?orientation=horizontal"
              title="Sal Rodriguez LiveAvatar patient reference"
              allow="microphone; fullscreen"
              allowFullScreen
              className="aspect-video w-full max-w-4xl rounded bg-[#171717]"
            />
          </section>
        )}
      </div>
    </>
  );
}
