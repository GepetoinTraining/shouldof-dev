import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconExternalLink, IconHeart } from '@tabler/icons-react';
import wikiContent from '@/data/wiki/content.json';

const wikiData = wikiContent as Record<string, any>;
type WikiSlug = keyof typeof wikiContent;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return Object.keys(wikiContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const wiki = wikiData[slug];
    if (!wiki) return {};

    return {
        title: `${wiki.title} — shouldof.dev`,
        description: wiki.sections.who,
    };
}

export default async function WikiPage({ params }: PageProps) {
    const { slug } = await params;
    const wiki = wikiData[slug];

    if (!wiki) notFound();

    return (
        <>
            <header className="site-header">
                <Link href="/" className="site-logo">
                    <span className="logo-dot" />
                    shouldof.dev
                </Link>
                <nav className="nav-links">
                    <Link href="/" className="nav-link">← Back to Graph</Link>
                </nav>
            </header>

            <article className="wiki-page">
                {/* Header */}
                <div className="wiki-header">
                    <div className="wiki-package-name">{wiki.packageName}</div>
                    <h1 className="wiki-title">{wiki.title}</h1>
                    <p className="wiki-creator-location">
                        📍 {wiki.location} &nbsp;·&nbsp; {wiki.subtitle}
                    </p>
                </div>

                {/* Who */}
                <section className="wiki-section">
                    <h2 className="wiki-section-title">Who</h2>
                    <div className="wiki-body">
                        <p>{wiki.sections.who}</p>
                    </div>
                </section>

                {/* The Moment */}
                <section className="wiki-section">
                    <h2 className="wiki-section-title">The Moment</h2>
                    <div className="wiki-body">
                        <p>{wiki.sections.the_moment}</p>
                    </div>
                </section>

                {/* What It Does */}
                <section className="wiki-section">
                    <h2 className="wiki-section-title">What It Does</h2>
                    <div className="wiki-body">
                        <p>{wiki.sections.what_it_does}</p>
                    </div>
                </section>

                {/* Impact */}
                <section className="wiki-section">
                    <h2 className="wiki-section-title">Impact</h2>
                    <div className="wiki-body">
                        <p>{wiki.sections.impact}</p>
                    </div>
                </section>

                {/* Connections */}
                <section className="wiki-section">
                    <h2 className="wiki-section-title">Connections</h2>
                    <div className="wiki-body">
                        <p>{wiki.sections.connections}</p>
                    </div>
                </section>

                {/* Special Note (Aaron Swartz) */}
                {'special_note' in wiki.sections && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title" style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}>
                            In Memoriam
                        </h2>
                        <div className="wiki-body">
                            <p>{(wiki.sections as any).special_note}</p>
                        </div>
                    </section>
                )}

                {/* Stats */}
                <div className="wiki-stats-grid">
                    {Object.entries(wiki.stats).map(([key, value]) => (
                        <div key={key} className="wiki-stat-card">
                            <div className="value">{String(value)}</div>
                            <div className="label">{key.replace(/_/g, ' ')}</div>
                        </div>
                    ))}
                </div>

                {/* Links */}
                <section className="wiki-section" style={{ marginTop: 40 }}>
                    <h2 className="wiki-section-title">Links</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {wiki.links.map((link: { label: string; url: string }) => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: 'var(--accent-violet-light)',
                                    textDecoration: 'none',
                                    fontSize: 15,
                                    transition: 'color 0.2s',
                                }}
                            >
                                <IconExternalLink size={16} />
                                {link.label}
                            </a>
                        ))}
                    </div>
                </section>

                {/* Donate / Special Handling */}
                {wiki.no_donate_button ? (
                    <section className="wiki-section" style={{ marginTop: 40 }}>
                        <div
                            style={{
                                padding: '20px 24px',
                                background: 'var(--bg-surface)',
                                borderRadius: 12,
                                border: '1px solid rgba(244, 63, 94, 0.15)',
                                fontStyle: 'italic',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.7,
                                fontSize: 15,
                            }}
                        >
                            {wiki.donate_alternative}
                        </div>
                    </section>
                ) : (
                    <section className="wiki-section" style={{ marginTop: 40 }}>
                        <button
                            className="hero-cta"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <IconHeart size={18} />
                            Thank This Developer
                        </button>
                        <p
                            style={{
                                textAlign: 'center',
                                fontSize: 13,
                                color: 'var(--text-muted)',
                                marginTop: 12,
                            }}
                        >
                            Send a free thank-you message. No payment required — the words matter most.
                        </p>
                    </section>
                )}

                {/* Thank You Wall */}
                <section className="thank-you-wall">
                    <h2 className="wiki-section-title">Thank-You Wall</h2>
                    <div
                        style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: 14,
                        }}
                    >
                        Be the first to say thank you. 💜
                    </div>
                </section>

                {/* Transparency Note */}
                <div
                    style={{
                        marginTop: 40,
                        padding: '12px 16px',
                        background: 'rgba(124, 58, 237, 0.05)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                    }}
                >
                    This wiki was written by a human. No AI was involved.
                </div>
            </article>

            {/* Footer */}
            <footer className="site-footer">
                <p className="footer-text">
                    Built with <span className="footer-heart">♥</span> at Node Zero, Joinville, SC, Brazil
                </p>
            </footer>
        </>
    );
}
