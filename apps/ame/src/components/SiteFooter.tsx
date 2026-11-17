export default function SiteFooter() {
  return (
    <>
      <section
        aria-label="Project contacts and Live AI Avatar information"
        className="bg-white"
      >
        <div className="chwe-shell grid grid-cols-2 gap-7 py-8 max-[700px]:grid-cols-1 max-[700px]:gap-5">
          <div className="border-l-[3px] border-[#cfb87c] bg-chwe-soft px-6 py-5 text-[0.9rem] leading-relaxed">
            <p className="m-0">
              <a
                href="mailto:Clint.Carlson@cuanschutz.edu"
                className="font-semibold underline underline-offset-2"
              >
                Contact Clint Carlson
              </a>{" "}
              to learn more about the Live AI Avatar project.
            </p>
          </div>
          <div className="border-r-[3px] border-[#cfb87c] bg-chwe-soft px-6 py-5 text-right text-[0.9rem] leading-relaxed max-[700px]:border-r-0 max-[700px]:border-l-[3px] max-[700px]:text-left">
            <p className="m-0 mb-2">
              Learn more about Live AI Avatars at CU Anschutz.
            </p>
            <a
              href="https://xr.cuanschutz.edu/"
              className="font-semibold underline underline-offset-2"
            >
              Meet Grace, our CU-AMC Avatar ↗
            </a>
          </div>
        </div>
      </section>
      <footer className="border-t-[5px] border-[#cfb87c] bg-[#171717] text-[#dddddd]">
        <div className="chwe-shell flex justify-between gap-4 py-[25px] text-xs max-[700px]:flex-col">
          <span>
            University of Colorado Anschutz Medical Campus · Colorado School of
            Public Health · Centers for Health, Work &amp; Environment
          </span>
          <div className="flex shrink-0 flex-col items-end gap-1 max-[700px]:items-start">
            <a
              href="https://xr.cuanschutz.edu/"
              className="text-[#dddddd] hover:text-[#cfb87c]"
            >
              xr.cuanschutz.edu ↗
            </a>
            <span className="text-[10px] text-[#aaaaaa]">
              Last updated: Nov 13, 2026 · QR code &amp; multi-tab assessment
              update
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
