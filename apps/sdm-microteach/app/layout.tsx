import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ella | MicroTeach Practice - CU School of Dental Medicine",
  description: "Practice a DSOR 5341 MicroTeach with Ella and review the guidelines and course rubric."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-screen bg-sdm-soft text-sdm-ink font-sans flex flex-col">
    <a className="skip-link" href="#main">Skip to practice</a>
    <header className="bg-sdm-black text-white border-b-[5px] border-b-sdm-gold"><div className="sdm-shell py-7">
      <p className="m-0 mb-2 text-[13px] font-bold uppercase tracking-[1.1px] text-sdm-gold">University of Colorado Anschutz Medical Campus</p>
      <h1 className="m-0 text-[31px] font-semibold leading-[1.2]">School of Dental Medicine</h1>
      <p className="m-0 mt-2 text-base text-[#d6d6d6]">DSOR 5341 · Fundamentals of Teaching · MicroTeach Practice</p>
    </div></header>
    <main id="main" className="flex-1">{children}</main>
    <footer className="bg-white border-t border-sdm-line"><div className="sdm-shell py-5 text-[13px] text-[#777]">University of Colorado Anschutz Medical Campus · School of Dental Medicine</div></footer>
  </body></html>;
}
