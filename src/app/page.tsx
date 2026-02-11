import { Suspense } from 'react';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/HeroSection';
import StoriesSection from '@/components/StoriesSection';

export default function HomePage() {
  return (
    <Providers>
      <Header />

      <main style={{ position: 'relative' }}>
        {/* Hero: Graph + Overlay with Dive-In mode */}
        <HeroSection />

        {/* Manifesto */}
        <section className="manifesto">
          <blockquote className="manifesto-quote">
            Everything you use was loved into existence by someone,
            and the minimum response to that is to say their name.
          </blockquote>
        </section>

        {/* Featured Stories — dynamic from DB */}
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
              Loading stories…
            </div>
          }
        >
          <StoriesSection />
        </Suspense>
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
