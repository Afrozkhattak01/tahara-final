'use client';

import { useEffect, useState } from 'react';
import './governance.css';

/**
 * Platform → Governance. One job: let the visitor choose between two ways of
 * scoping an AI compliance assessment (master vs. specific). Nothing else.
 *
 * Isolated from the landing page: its own scoped CSS, tokens declared on the
 * .governance root wrapper, no global resets outside that scope.
 */
export default function GovernancePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`governance${scrolled ? ' is-scrolled' : ''}`}>
      {/* 1 · fixed background layers */}
      <div className="gv-bg" aria-hidden="true" />
      <div className="gv-grid" aria-hidden="true" />
      <div className="gv-blob gv-blob-1" aria-hidden="true" />
      <div className="gv-blob gv-blob-2" aria-hidden="true" />

      {/* 2 · site header */}
      <header className="gv-header">
        <div className="gv-head-inner">
          <a className="gv-brand" href="/">
            <span className="gv-brand-mark" aria-hidden="true" />
            Tahara AI
          </a>
          <nav className="gv-nav" aria-label="Primary">
            <a href="/#platform">Platform</a>
            <a href="/#lifecycle">Lifecycle</a>
            <a href="/#stack">Architecture</a>
            <a href="/#resources">Resources</a>
            <a href="/#faq">FAQ</a>
          </nav>
          <div className="gv-head-right">
            <a className="gv-signin" href="/#">Sign in</a>
            <a className="gv-btn gv-btn-solid" href="/platform/governance/master">Request a demo</a>
          </div>
        </div>
      </header>

      {/* 3 · platform sub-bar */}
      <div className="gv-subbar">
        <div className="gv-subbar-inner">
          <span className="gv-sub-label">Platform</span>
          <span className="gv-sub-div" aria-hidden="true" />
          <nav className="gv-tabs" aria-label="Platform sections">
            <a href="/#platform">Overview</a>
            <a className="is-current" href="/platform/governance" aria-current="page">Governance</a>
            <a href="/#platform">Adversarial</a>
            <a href="/#platform">PII</a>
          </nav>
          <a className="gv-btn gv-btn-solid gv-sub-cta" href="/platform/governance/master">Start assessment</a>
        </div>
      </div>

      {/* 4 · main */}
      <main className="gv-main">
        <div className="gv-wrap">
          <div className="gv-headblock gv-reveal" style={{ '--i': 0 }}>
            <span className="gv-kicker">
              <span className="gv-dot" aria-hidden="true" />
              governance / scope
            </span>
            <h1>What are you being held to?</h1>
            <p className="gv-lede">
              Most companies are bound by more than one framework. Scope it either way.
            </p>
          </div>

          {/* 5 · the two route cards */}
          <section className="gv-cards" aria-label="Choose an assessment route">
            {/* Card A — recommended */}
            <a className="gv-card gv-card--rec gv-reveal" href="/platform/governance/master" style={{ '--i': 1 }}>
              <div className="gv-card-bar">
                <span className="gv-marker" aria-hidden="true" />
                <span className="gv-path">assess / master</span>
                <span className="gv-tag">Recommended</span>
              </div>
              <div className="gv-card-body">
                <svg className="gv-glyph" viewBox="0 0 74 56" fill="none" aria-hidden="true">
                  <line className="guide" x1="44" y1="4" x2="44" y2="52" />
                  <path d="M2 8 H22 C34 8 32 28 44 28" style={{ '--d': 0, '--l': 58 }} />
                  <path d="M2 21 H24 C34 21 34 28 44 28" style={{ '--d': 1, '--l': 50 }} />
                  <path d="M2 35 H24 C34 35 34 28 44 28" style={{ '--d': 2, '--l': 50 }} />
                  <path d="M2 48 H22 C34 48 32 28 44 28" style={{ '--d': 3, '--l': 58 }} />
                  <line className="merged" x1="44" y1="28" x2="72" y2="28" style={{ '--d': 4, '--l': 32 }} />
                  <circle className="node" cx="44" cy="28" r="3.2" />
                </svg>
                <h2>Master framework</h2>
                <p className="gv-oneline">Every framework that binds you, from one set of answers.</p>
                <div className="gv-spec">
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">frameworks</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v">4 + region</span>
                  </div>
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">questions</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v gv-v-green">&minus;40%</span>
                  </div>
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">output</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v">1 profile</span>
                  </div>
                </div>
                <span className="gv-cta">
                  Build my master set
                  <span className="gv-arrow" aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </a>

            {/* Card B — targeted */}
            <a className="gv-card gv-reveal" href="/platform/governance/specific" style={{ '--i': 2 }}>
              <div className="gv-card-bar">
                <span className="gv-marker" aria-hidden="true" />
                <span className="gv-path">assess / specific</span>
                <span className="gv-tag">Targeted</span>
              </div>
              <div className="gv-card-body">
                <svg className="gv-glyph" viewBox="0 0 74 56" fill="none" aria-hidden="true">
                  <line className="guide" x1="37" y1="4" x2="37" y2="52" />
                  <line className="merged" x1="2" y1="28" x2="72" y2="28" style={{ '--d': 0, '--l': 74 }} />
                  <path d="M37 14 v6" style={{ '--d': 1, '--l': 8 }} />
                  <path d="M37 36 v6" style={{ '--d': 2, '--l': 8 }} />
                  <circle className="node" cx="37" cy="28" r="3.2" />
                </svg>
                <h2>Specific framework</h2>
                <p className="gv-oneline">One named standard. Scoped to that alone.</p>
                <div className="gv-spec">
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">frameworks</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v">1</span>
                  </div>
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">onboarding</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v gv-v-signal">5 working days</span>
                  </div>
                  <div className="gv-spec-row">
                    <span className="gv-spec-k">output</span>
                    <span className="gv-lead" aria-hidden="true" />
                    <span className="gv-spec-v">1 report</span>
                  </div>
                </div>
                <span className="gv-cta">
                  Choose a standard
                  <span className="gv-arrow" aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </a>
          </section>

          {/* 6 · closing line */}
          <p className="gv-closing gv-reveal" style={{ '--i': 3 }}>
            not sure? run the <a href="/platform/governance">applicability engine</a> first
          </p>
        </div>
      </main>

      {/* 7 · footer */}
      <footer className="gv-footer">
        <div className="gv-footer-inner">
          <span>&copy; 2026 TAHARA AI</span>
          <span>SAFE &middot; ETHICAL &middot; TRANSPARENT</span>
        </div>
      </footer>
    </div>
  );
}
