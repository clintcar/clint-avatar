export default function SiteFooter() {
  return (
    <>
      <aside
        aria-labelledby="cu-avatar-information"
        className="ame-shell mb-16 border border-ame-line border-t-4 border-t-ame-gold bg-[#f7f7f6] px-6 py-5"
      >
        <h2 id="cu-avatar-information" className="mb-1.5 text-[19px] font-bold">
          Live AI Avatars at CU Anschutz
        </h2>
        <p className="mb-2">Learn more about Live AI Avatars at CU Anschutz.</p>
        <a href="https://xr.cuanschutz.edu/" className="font-bold underline">
          Meet Grace, our CU-AMC Avatar ↗
        </a>
      </aside>
      <footer>
        <div className="bg-ame-charcoal py-[27px] text-sm text-[#eee]">
          <div className="ame-shell">
            <strong className="mb-[7px] block text-[17px]">
              University of Colorado Anschutz Medical Campus
            </strong>
            AI-powered educational experiences · Aurora, Colorado
          </div>
        </div>
        <div className="bg-ame-black py-[13px] text-xs text-[#bbb]">
          <div className="ame-shell">
            © {new Date().getFullYear()} The Regents of the University of
            Colorado. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
