export default function NavBar() {
  return (
    <header>
      <div className="bg-[#050505] text-white">
        <div className="ame-shell flex min-h-[52px] items-center justify-between gap-5 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-1 max-[680px]:py-2.5">
          <a
            href="https://www.cuanschutz.edu/"
            className="inline-flex items-center gap-2.5 text-lg"
          >
            <span
              aria-hidden="true"
              className="pr-1 text-[19px] font-black tracking-[-0.13em] text-ame-gold"
            >
              CU
            </span>
            <span>
              University of Colorado <strong>Anschutz</strong>
            </span>
          </a>
          <a
            href="https://xr.cuanschutz.edu/"
            className="text-[13px] text-[#ddd] hover:underline"
          >
            CU-AMC XR &amp; AI Experiences ↗
          </a>
        </div>
      </div>
      <div className="border-b-4 border-ame-gold bg-ame-charcoal text-white">
        <div className="ame-shell py-7">
          <h1 className="mb-[5px] text-[27px] font-bold leading-tight max-[680px]:text-[23px]">
            Live Avatars &amp; Scenarios
          </h1>
          <p className="text-[17px] text-[#e5e5e5]">
            Clinical Feedback Practice · CU Anschutz Medical Campus
          </p>
        </div>
      </div>
    </header>
  );
}
