"use client";
import { useEffect, useRef } from "react";
import { PUBLIC_EXPERIENCE_URL } from "../../app/lib/presentationScenarios";

export function ExploreQr({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="explore-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="explore-title"
    >
      <button
        className="present-button secondary dialog-close"
        onClick={onClose}
      >
        Close
      </button>
      <p className="event-eyebrow">Continue the conversation</p>
      <h2 id="explore-title">Explore the avatars</h2>
      <p>Four audiences. Four ways to practice public health communication.</p>
      <img
        src="/research-exchange-qr.svg"
        width="320"
        height="320"
        alt="QR code linking to the public Live Avatar Conversations website"
      />
      <a href={PUBLIC_EXPERIENCE_URL} target="_blank" rel="noreferrer">
        clint-avatar-pubhealth.vercel.app
      </a>
      <p className="qr-note">
        Please wait until after the live demonstration to start a conversation.
      </p>
      <p className="qr-note">
        The QR code opens the public site. Presentation updates are being
        reviewed in this preview.
      </p>
      <a href="mailto:Clint.Carlson@cuanschutz.edu">
        Clint.Carlson@cuanschutz.edu
      </a>
    </dialog>
  );
}
