import { Suspense } from 'react';
import Link from 'next/link';
import Providers from '@/components/Providers';
import FundingWidget from '@/components/FundingWidget';

export const metadata = {
    title: 'Fund the Storyteller — shouldof.dev',
    description: 'Community-funded AI wiki generation. Every $1 tells ~33 stories about the humans behind open source.',
};

export default function FundPage() {
    return (
        <Providers>
            <header className="site-header">
                <Link href="/" className="site-logo">
                    <img src="/favicon.svg" alt="" width={20} height={20} style={{ display: 'block' }} />
                    shouldof.dev
                </Link>
                <nav className="nav-links">
                    <Link href="/" className="nav-link">← Back to Graph</Link>
                </nav>
            </header>

            <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔮</div>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        marginBottom: 12,
                    }}>
                        Fund the Storyteller
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: 16,
                        lineHeight: 1.7,
                        maxWidth: 480,
                        margin: '0 auto',
                    }}>
                        Every wiki on shouldof.dev is written by Claude — an AI that reads npm metadata,
                        GitHub READMEs, and public context to tell the human story behind each package.
                        <br /><br />
                        <strong style={{ color: 'var(--text-primary)' }}>
                            Every $1 funds ~33 stories.
                        </strong>
                    </p>
                </div>

                {/* Transparency Widget — wrapped in Suspense for useSearchParams */}
                <Suspense fallback={
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Loading funding stats…
                    </div>
                }>
                    <FundingWidget />
                </Suspense>

                {/* Explanation */}
                <section style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>How it works</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { icon: '📦', text: 'A developer connects their GitHub repo' },
                            { icon: '🔍', text: 'We read their package.json and find all dependencies' },
                            { icon: '🤖', text: 'Claude researches each package and writes a wiki about the creator' },
                            { icon: '💰', text: 'Each wiki costs ~$0.03 in API credits' },
                            { icon: '💳', text: 'You fund via Stripe — secure, instant, transparent' },
                            { icon: '💜', text: 'Your contribution funds the next batch of stories' },
                        ].map((step, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    gap: 14,
                                    alignItems: 'flex-start',
                                    padding: '12px 16px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: 10,
                                    border: '1px solid rgba(124, 58, 237, 0.06)',
                                }}
                            >
                                <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
                                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why community-funded? */}
                <section style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Why community-funded?</h2>
                    <p style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'var(--text-secondary)',
                    }}>
                        shouldof.dev was built at Node Zero, a small school in Joinville, Brazil. The same API
                        budget that generates these wikis also powers the school&apos;s AI tools. If this project
                        gets thousands of users, the wiki generation would eat through that budget in days.
                        <br /><br />
                        By funding the storyteller, you ensure (1) Pedro&apos;s school keeps running, and
                        (2) every new package that enters the graph gets a human story told about its creator.
                    </p>
                </section>

                {/* Pool status: what happens when empty */}
                <section style={{ marginTop: 40, marginBottom: 64 }}>
                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(244, 63, 94, 0.04)',
                        border: '1px solid rgba(244, 63, 94, 0.15)',
                        borderRadius: 10,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                    }}>
                        <strong style={{ color: '#f43f5e' }}>When the pool runs dry:</strong> New wikis enter a
                        queue instead of being generated immediately. The package appears on the graph but shows
                        &ldquo;Story pending — fund the storyteller to unlock.&rdquo; Existing wikis are never removed.
                    </div>
                </section>
            </main>

            <footer className="site-footer">
                <p className="footer-text">
                    Built with <span className="footer-heart">♥</span> at Node Zero, Joinville, SC, Brazil
                </p>
            </footer>
        </Providers>
    );
}
