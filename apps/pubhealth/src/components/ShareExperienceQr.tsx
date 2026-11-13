"use client";

import { useEffect, useRef, useState } from "react";

const PUBLIC_URL = "https://clint-avatar-pubhealth.vercel.app/";

export function ShareExperienceQr() {
  const [expanded, setExpanded] = useState(false);
  const [avatarFullscreen, setAvatarFullscreen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (expanded) dialog.current?.showModal();
  }, [expanded]);

  useEffect(() => {
    const syncFullscreen = () => {
      const active = Boolean(document.fullscreenElement);
      setAvatarFullscreen(active);
      if (active) {
        dialog.current?.close();
        setExpanded(false);
      }
    };
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  function close() {
    dialog.current?.close();
    setExpanded(false);
    trigger.current?.focus();
  }

  if (avatarFullscreen) return null;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Enlarge QR code to explore the avatars"
        aria-haspopup="dialog"
        className="share-experience-qr flex w-[340px] flex-col items-center gap-2 rounded-[4px] border border-chwe-line bg-white px-4 py-4 text-center shadow-chwe hover:bg-chwe-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chwe-blue"
      >
        <img
          src="/research-exchange-qr.svg"
          width="300"
          height="300"
          alt="QR code for the Live Avatar Conversations public page"
          className="share-experience-qr-image h-[300px] w-[300px]"
        />
        <strong className="share-experience-qr-label text-lg text-chwe-blue-dark">
          Explore the avatars
        </strong>
        <span className="share-experience-qr-caption text-sm text-chwe-muted">
          Scan to open · Click to enlarge
        </span>
      </button>
      {expanded && (
        <dialog
          ref={dialog}
          aria-labelledby="share-experience-title"
          onCancel={close}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          className="m-auto max-h-[94vh] w-[min(620px,calc(100vw-32px))] overflow-auto rounded-lg border-0 bg-white p-7 text-center text-chwe-ink shadow-chwe backdrop:bg-black/70"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className="rounded border border-chwe-line px-4 py-2 text-sm font-bold text-chwe-blue-dark hover:bg-chwe-soft"
            >
              Close
            </button>
          </div>
          <h2
            id="share-experience-title"
            className="mt-2 text-[2rem] font-bold"
          >
            Explore the avatars
          </h2>
          <p className="mt-2 text-chwe-muted">
            Practice conversations with policymakers, journalists, and community
            members.
          </p>
          <img
            src="/research-exchange-qr.svg"
            width="360"
            height="360"
            alt="QR code linking to the Live Avatar Conversations public page"
            className="mx-auto my-4 h-auto w-[360px] max-w-full"
          />
          <a
            href={PUBLIC_URL}
            target="_blank"
            rel="noreferrer"
            className="break-all font-bold text-chwe-blue underline underline-offset-4"
          >
            clint-avatar-pubhealth.vercel.app
          </a>
          <p className="mt-4 text-sm text-chwe-muted">
            During a live demonstration, please wait until afterward to start a
            conversation.
          </p>
        </dialog>
      )}
    </>
  );
}
