import { Suspense } from 'react';
import Link from 'next/link';
import { IconBrandGithub } from '@tabler/icons-react';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import StoryCard from '@/components/StoryCard';
import GraphSection from './GraphSection';

export default function HomePage() {
  return (
    <Providers>
      <Header />

      <main style={{ position: 'relative' }}>
        {/* Hero: Graph + Overlay */}
        <div style={{ position: 'relative', height: '100vh' }}>
          <Suspense
            fallback={
              <div
                style={{
                  width: '100%',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-deep)',
                }}
              >
                <div className="logo-dot" style={{ width: 16, height: 16 }} />
              </div>
            }
          >
            <GraphSection />
          </Suspense>

          {/* Hero overlay */}
          <div className="hero-overlay">
            <h1 className="hero-tagline">
              Every npm install is a person.
            </h1>
            <p className="hero-subtitle">
              See the humans behind your code. Connect your project.
              Watch the web of gratitude grow.
            </p>
            <Link href="/connect" className="hero-cta">
              <IconBrandGithub size={20} />
              Connect Your GitHub
            </Link>
          </div>

          {/* Stats bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">2</div>
              <div className="stat-label">Stories</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Thank Yous</div>
            </div>
          </div>
        </div>

        {/* Manifesto */}
        <section className="manifesto">
          <blockquote className="manifesto-quote">
            Everything you use was loved into existence by someone,
            and the minimum response to that is to say their name.
          </blockquote>
        </section>

        {/* Featured Stories */}
        <section
          style={{
            padding: '64px 24px',
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: 48,
              letterSpacing: '-0.02em',
            }}
          >
            Stories Behind the Code
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            <StoryCard
              slug="markdown"
              title="John Gruber & Aaron Swartz"
              subtitle="Markdown (.md)"
              excerpt="The format everything is written in. Gruber wanted readable plain text for the web. Aaron Swartz co-designed the spec at age 17."
              accent="#f43f5e"
            />
            <StoryCard
              slug="mermaid"
              title="Knut Sveidqvist"
              subtitle="Mermaid.js"
              excerpt="74,000 GitHub stars. 8 million users. 3 Medium followers. He built diagrams from text — and nobody said thank you."
              accent="#7c3aed"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <p className="footer-text">
          Built with <span className="footer-heart">♥</span> at Node Zero, Joinville, SC, Brazil
        </p>
      </footer>
    </Providers>
  );
}
