"use client";

import { useCallback, useRef } from "react";
import { getEmbedUrl } from "../../app/lib/embeddedAvatars";

type EmbeddedAvatarProps = {
  name: string;
  embedId: string;
};

export function EmbeddedAvatar({ name, embedId }: EmbeddedAvatarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(async () => {
    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed", error);
    }
  }, []);

  return (
    <div className="w-full rounded-xl border border-zinc-300 overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2 bg-zinc-100 border-b border-zinc-300">
        <h3 className="text-sm font-semibold text-zinc-900">{name}</h3>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div ref={wrapperRef} className="avatar-embed w-full">
          <iframe
            src={getEmbedUrl(embedId)}
            allow="microphone"
            title={`LiveAvatar Embed - ${name}`}
            className="avatar-embed-frame"
          />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="avatar-embed-button"
          >
            View Full Screen
          </button>
        </div>
      </div>
    </div>
  );
}
