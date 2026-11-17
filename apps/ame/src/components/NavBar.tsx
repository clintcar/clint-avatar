"use client";

export default function NavBar() {
  return (
    <header className="bg-white border-b border-chwe-line">
      <div className="chwe-shell min-h-[106px] flex items-center justify-between gap-7 py-[22px] max-[800px]:flex-col max-[800px]:items-start">
        <div aria-label="Colorado School of Public Health, Centers for Health, Work & Environment">
          <p className="m-0 mb-1 text-[1.05rem] font-bold tracking-[0.01em] text-[#555d61]">
            Colorado School of Public Health
          </p>
          <p className="m-0 text-chwe-blue-dark font-bold leading-[1.15] text-[clamp(1.3rem,2.3vw,2rem)]">
            Centers for Health, Work & Environment
          </p>
          <div
            className="w-[74px] h-[5px] mt-[13px] bg-chwe-green"
            aria-hidden="true"
          />
        </div>
        <div className="shrink-0 pl-6 border-l border-chwe-line text-chwe-muted text-[0.9rem] font-bold uppercase tracking-[0.08em] text-right max-[800px]:pl-0 max-[800px]:pt-3.5 max-[800px]:border-l-0 max-[800px]:border-t max-[800px]:w-full max-[800px]:text-left">
          Live Avatar Conversations
        </div>
      </div>
    </header>
  );
}
