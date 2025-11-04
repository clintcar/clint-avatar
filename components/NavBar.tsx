"use client";

import React from "react";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6">
        <div className="flex flex-row items-center gap-4">
          <div>
            <p className="text-xl font-semibold text-black">
            Clint Carlson Live AI Avatars
            </p>
          </div>
        </div>
        {/* Right-side links are intentionally hidden */}
      </div>
    </>
  );
}
