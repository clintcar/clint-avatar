"use client";

import React from "react";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6">
        <div className="flex flex-row items-center gap-4">
          <p className="text-xl font-semibold text-black">
            Live AI Avatar - Meet Judy
          </p>
        </div>
        <div>
          <p className="text-xl font-semibold text-black">
            Author: Clint Carlson
          </p>
        </div>
      </div>
    </>
  );
}
