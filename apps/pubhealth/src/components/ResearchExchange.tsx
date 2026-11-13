"use client";
import { useState } from "react";
import { PRESENTATION_SCENARIOS } from "../../app/lib/presentationScenarios";
import { ExploreQr } from "./ExploreQr";

export function ResearchExchange() {
  const [showQr, setShowQr] = useState(false);
  return (
    <div className="exchange-home">
      <section className="exchange-hero">
        <div className="chwe-shell exchange-hero-inner">
          <div>
            <p className="event-eyebrow">
              ColoradoSPH Research Exchange · November 13, 2026
            </p>
            <h1>
              Public Health Communication
              <br />
              <span>in Action: A.I. Avatars</span>
            </h1>
            <p className="hero-description">
              Translate evidence. Listen with curiosity.
              <br />
              Practice the conversations that make a difference.
            </p>
            <p className="project-credit">
              Developed in partnership by Lee Newman and Clint Carlson
              <br />
              Centers for Health, Work &amp; Environment · CU Anschutz
            </p>
          </div>
          <button
            className="hero-qr"
            onClick={() => setShowQr(true)}
            aria-label="Enlarge QR code to explore the avatars"
          >
            <img
              src="/research-exchange-qr.svg"
              width="170"
              height="170"
              alt="QR code for the public avatar experience"
            />
            <strong>Explore the avatars ↗</strong>
            <span>Scan now. Try after the demo.</span>
          </button>
        </div>
      </section>
      <section
        className="chwe-shell exchange-scenarios"
        aria-labelledby="scenario-heading"
      >
        <div className="section-intro">
          <div>
            <p className="event-eyebrow">One skill. Different audiences.</p>
            <h2 id="scenario-heading">Choose a conversation</h2>
          </div>
          <a className="quiet-link" href="/practice">
            Individual practice view ↗
          </a>
        </div>
        <div className="scenario-cards">
          {PRESENTATION_SCENARIOS.map((scenario) => (
            <a
              key={scenario.slug}
              href={`/present/${scenario.slug}`}
              className="scenario-card"
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${scenario.avatar.name} presentation in a new tab`}
            >
              <div className="scenario-image">
                <img
                  src={scenario.avatar.previewImage}
                  alt={scenario.avatar.name}
                />
                <span className="scenario-number">0{scenario.number}</span>
              </div>
              <div className="scenario-card-copy">
                <p className="event-eyebrow">{scenario.role}</p>
                <h3>{scenario.avatar.name}</h3>
                <p>{scenario.audience}</p>
                <span className="scenario-skills">{scenario.skill}</span>
                <span className="scenario-open">
                  Open presentation <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="demo-flow">
          <span>
            <b>01</b> Meet your audience
          </span>
          <span>
            <b>02</b> Have a conversation
          </span>
          <span>
            <b>03</b> Reflect &amp; review feedback
          </span>
        </div>
        <div className="volunteer-note">
          <strong>For our volunteers</strong>
          <p>
            Use your own words. This is an opportunity to explore and practice.
            Afterward, we’ll discuss what happened and hear the avatar’s
            feedback.
          </p>
        </div>
      </section>
      <section className="exchange-closing">
        <div className="chwe-shell">
          <p className="event-eyebrow">Keep exploring</p>
          <h2>What would you try saying differently?</h2>
          <p>Bring your curiosity to the next conversation.</p>
          <button className="present-button" onClick={() => setShowQr(true)}>
            Show QR code
          </button>
        </div>
      </section>
      {showQr && <ExploreQr onClose={() => setShowQr(false)} />}
    </div>
  );
}
