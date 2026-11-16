import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPCP | Interprofessional SBAR Handoff | CU Anschutz",
  description: "Practice an interprofessional handoff and download formative feedback from the I-SBAR checklist.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-chwe-ink">
        <a className="skip-link" href="#main">Skip to handoff practice</a>
        <main id="main" className="flex-1">{children}</main>
        <footer className="border-t border-chwe-line bg-chwe-soft">
          <div className="chwe-shell flex flex-wrap justify-between gap-4 py-5 text-sm text-chwe-muted">
            <span>University of Colorado Anschutz Medical Campus · Interprofessional Collaborative Practice</span>
            <a href="https://xr.cuanschutz.edu/">CU Anschutz XR &amp; AI Experiences ↗</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
