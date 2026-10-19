"use client";

import { useCallback, useState } from "react";
import { PATIENTS, type Patient } from "../../app/lib/patients";
import {
  AvatarPreview,
  AvatarSession,
  fetchSessionToken,
} from "./AvatarSession";
import { ClinicalDashboard } from "./ClinicalDashboard";
import { TranscriptPanel } from "./TranscriptPanel";
import type { LiveAvatarSessionMessage } from "../liveavatar/types";

export function MentalHealthExperience() {
  const [patient, setPatient] = useState<Patient>(() => {
    const first = PATIENTS[0];
    if (!first) {
      throw new Error("At least one patient is required.");
    }
    return first;
  });
  const [sessionToken, setSessionToken] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveAvatarSessionMessage[]>([]);
  const [notes, setNotes] = useState("");

  const selectPatient = (next: Patient) => {
    if (next.id === patient.id) {
      return;
    }
    setPatient(next);
    setSessionToken("");
    setError(null);
    setMessages([]);
    setNotes("");
  };

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    setMessages([]);
    try {
      const token = await fetchSessionToken(patient);
      setSessionToken(token);
    } catch (startError) {
      setError((startError as Error).message);
    } finally {
      setIsStarting(false);
    }
  }, [patient]);

  const handleMessagesChange = useCallback(
    (next: LiveAvatarSessionMessage[]) => {
      if (next.length > 0) {
        setMessages(next);
      }
    },
    [],
  );

  return (
    <div className="sdm-shell py-8 pb-16">
      <p className="m-0 mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#777]">
        Patient simulation
      </p>
      <h2 className="m-0 text-[27px] font-semibold leading-tight">
        Select a patient
      </h2>
      <p className="m-0 mt-2 max-w-[46rem] text-base text-sdm-muted">
        Switch patients with the buttons below.
      </p>

      <div
        className="mt-5 inline-flex overflow-hidden rounded-lg border border-sdm-line bg-white"
        role="group"
        aria-label="Choose a patient"
      >
        {PATIENTS.map((option) => {
          const active = option.id === patient.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              disabled={Boolean(sessionToken) && !active}
              onClick={() => selectPatient(option)}
              className={`min-w-[140px] px-5 py-3 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "bg-sdm-black text-white"
                  : "bg-white text-sdm-ink hover:bg-sdm-soft"
              }`}
            >
              {option.name}
            </button>
          );
        })}
      </div>
      {sessionToken && (
        <p className="m-0 mt-2 text-sm text-sdm-muted">
          Stop the current chat before switching patients.
        </p>
      )}

      <p className="m-0 mt-4 max-w-[46rem] text-[15px] text-sdm-muted">
        {patient.summary} Your browser may ask for microphone permission before
        the session starts.
      </p>
      <div className="mt-4 max-w-[46rem] border-l-4 border-l-sdm-gold bg-white px-4 py-3 text-sm">
        <strong>Before you begin</strong>
        <p className="m-0 mt-1 text-sdm-muted">
          Find a quiet space and use headphones when possible. Request chart
          values in the clinical dashboard only when you would ask for them in
          clinic.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.95fr)]">
        <div>
          {sessionToken ? (
            <AvatarSession
              key={sessionToken}
              patient={patient}
              sessionAccessToken={sessionToken}
              onSessionEnded={() => setSessionToken("")}
              onMessagesChange={handleMessagesChange}
            />
          ) : (
            <AvatarPreview
              patient={patient}
              isStarting={isStarting}
              error={error}
              onStart={() => void handleStart()}
            />
          )}
          <TranscriptPanel
            patient={patient}
            messages={messages}
            notes={notes}
          />
        </div>
        <ClinicalDashboard
          key={patient.id}
          patient={patient}
          onNotesChange={setNotes}
        />
      </div>
    </div>
  );
}
