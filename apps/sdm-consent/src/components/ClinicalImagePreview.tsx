"use client";

import { useCallback, useEffect, useState } from "react";

type ClinicalImagePreviewProps = {
  src: string;
  alt: string;
};

export function ClinicalImagePreview({ src, alt }: ClinicalImagePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const closeExpanded = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpanded();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeExpanded, isExpanded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="group w-full min-w-0 rounded-md border border-zinc-700 bg-zinc-900 p-2 text-left cursor-zoom-in hover:border-zinc-500 transition-colors"
        aria-label={`Enlarge ${alt}`}
      >
        <div className="w-full min-w-0">
          <img
            src={src}
            alt={alt}
            className="block w-full h-auto max-w-full object-contain"
            style={{ maxHeight: "none" }}
          />
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 group-hover:text-zinc-400">
          Click to enlarge
        </p>
      </button>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={closeExpanded}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={closeExpanded}
            className="absolute top-4 right-4 rounded-md bg-zinc-900/90 text-zinc-100 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Close
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[96vw] max-h-[92vh] w-auto h-auto object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
