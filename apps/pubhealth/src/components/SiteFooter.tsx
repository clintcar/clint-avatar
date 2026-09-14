export default function SiteFooter() {
  return (
    <footer className="bg-chwe-blue-deep text-white">
      <div className="chwe-shell flex justify-between gap-[30px] py-[30px] text-[0.93rem] max-[800px]:flex-col max-[800px]:items-start">
        <p className="m-0">
          <strong>Centers for Health, Work & Environment</strong>
          <br />
          Colorado School of Public Health
        </p>
        <p className="m-0 text-white/70 text-right max-[800px]:text-left">
          Advancing worker health, safety, and well-being
        </p>
      </div>
    </footer>
  );
}
