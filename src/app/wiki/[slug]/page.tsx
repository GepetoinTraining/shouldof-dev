import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconExternalLink } from '@tabler/icons-react';
import wikiContent from '@/data/wiki/content.json';
import WikiInteractive from '@/components/WikiInteractive';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const staticWiki = wikiContent as Record<string, any>;

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for hand-written wikis only
export async function generateStaticParams() {
    return Object.keys(staticWiki).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;

    // Check static first
    if (staticWiki[slug]) {
        return {
            title: `${staticWiki[slug].title} — shouldof.dev`,
            description: staticWiki[slug].sections.who,
        };
    }

    // Check DB
    try {
        const [pkg] = await db.select().from(packages).where(eq(packages.slug, slug)).limit(1);
        if (pkg?.backstoryMd) {
            const backstory = JSON.parse(pkg.backstoryMd);
            return {
                title: `${backstory.title || pkg.creatorName || pkg.name} — shouldof.dev`,
                description: backstory.who || pkg.description,
            };
        }
        if (pkg) {
            return { title: `${pkg.name} — shouldof.dev`, description: pkg.description };
        }
    } catch {
        // fall through
    }

    return {};
}

export default async function WikiPage({ params }: PageProps) {
    const { slug } = await params;

    // === Static wiki (hand-written, always wins) ===
    if (staticWiki[slug]) {
        const wiki = staticWiki[slug];
        return renderWikiPage({
            slug,
            packageName: wiki.packageName,
            title: wiki.title,
            subtitle: wiki.subtitle,
            location: wiki.location,
            sections: wiki.sections,
            links: wiki.links,
            stats: wiki.stats,
            noDonateButton: wiki.no_donate_button,
            donateAlternative: wiki.donate_alternative,
            specialNote: wiki.sections.special_note,
            generatedBy: null,
            verified: true,
            claimed: false,
            claimedBy: null,
        });
    }

    // === DB-backed wiki ===
    let pkg;
    try {
        const [result] = await db.select().from(packages).where(eq(packages.slug, slug)).limit(1);
        pkg = result;
    } catch {
        notFound();
    }

    if (!pkg) notFound();

    // Package exists but no backstory yet
    if (!pkg.backstoryMd) {
        return renderEmptyWikiPage({
            slug,
            name: pkg.name,
            description: pkg.description,
            creatorName: pkg.creatorName,
            npmUrl: pkg.npmUrl,
            repoUrl: pkg.repoUrl,
        });
    }

    // Parse backstory
    const backstory = JSON.parse(pkg.backstoryMd);

    const stats: Record<string, string> = {};
    if (pkg.npmWeeklyDownloads) stats['weekly downloads'] = pkg.npmWeeklyDownloads.toLocaleString();
    if (pkg.userCount) stats['shouldof.dev users'] = String(pkg.userCount);
    if (pkg.thankYouCount) stats['thank yous'] = String(pkg.thankYouCount);

    return renderWikiPage({
        slug,
        packageName: pkg.name,
        title: backstory.title || pkg.creatorName || pkg.name,
        subtitle: backstory.subtitle || pkg.description || '',
        location: backstory.location || 'Open Source',
        sections: backstory,
        links: [
            pkg.npmUrl ? { label: 'npm', url: pkg.npmUrl } : null,
            pkg.repoUrl ? { label: 'GitHub', url: pkg.repoUrl } : null,
            pkg.homepageUrl ? { label: 'Homepage', url: pkg.homepageUrl } : null,
        ].filter((l): l is { label: string; url: string } => l !== null),
        stats,
        noDonateButton: false,
        donateAlternative: null,
        specialNote: null,
        generatedBy: pkg.backstoryGeneratedBy,
        verified: pkg.backstoryVerified || false,
        claimed: pkg.claimed || false,
        claimedBy: pkg.claimedBy,
    });
}

// === Renderers ===

interface WikiPageData {
    slug: string;
    packageName: string;
    title: string;
    subtitle: string;
    location: string;
    sections: any;
    links: { label: string; url: string }[];
    stats: Record<string, string>;
    noDonateButton: boolean;
    donateAlternative: string | null;
    specialNote: string | null;
    generatedBy: string | null;
    verified: boolean;
    claimed: boolean;
    claimedBy: string | null;
}

function renderWikiPage(data: WikiPageData) {
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
                {/* AI badge */}
                {data.generatedBy && !data.verified && (
                    <div
                        style={{
                            padding: '8px 14px',
                            background: 'rgba(124, 58, 237, 0.06)',
                            border: '1px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 8,
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            marginBottom: 24,
                        }}
                    >
                        ✨ AI-generated · Not yet verified by a human
                    </div>
                )}

                {/* Header */}
                <div className="wiki-header">
                    <div className="wiki-package-name">{data.packageName}</div>
                    <h1 className="wiki-title">{data.title}</h1>
                    <p className="wiki-creator-location">
                        📍 {data.location} &nbsp;·&nbsp; {data.subtitle}
                    </p>
                </div>

                {/* Sections */}
                {data.sections.who && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title">Who</h2>
                        <div className="wiki-body"><p>{data.sections.who}</p></div>
                    </section>
                )}

                {data.sections.the_moment && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title">The Moment</h2>
                        <div className="wiki-body"><p>{data.sections.the_moment}</p></div>
                    </section>
                )}

                {data.sections.what_it_does && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title">What It Does</h2>
                        <div className="wiki-body"><p>{data.sections.what_it_does}</p></div>
                    </section>
                )}

                {data.sections.impact && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title">Impact</h2>
                        <div className="wiki-body"><p>{data.sections.impact}</p></div>
                    </section>
                )}

                {data.sections.connections && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title">Connections</h2>
                        <div className="wiki-body"><p>{data.sections.connections}</p></div>
                    </section>
                )}

                {/* Special Note (In Memoriam) */}
                {data.specialNote && (
                    <section className="wiki-section">
                        <h2 className="wiki-section-title" style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}>
                            In Memoriam
                        </h2>
                        <div className="wiki-body"><p>{data.specialNote}</p></div>
                    </section>
                )}

                {/* Stats */}
                {Object.keys(data.stats).length > 0 && (
                    <div className="wiki-stats-grid">
                        {Object.entries(data.stats).map(([key, value]) => (
                            <div key={key} className="wiki-stat-card">
                                <div className="value">{String(value)}</div>
                                <div className="label">{key.replace(/_/g, ' ')}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Links */}
                {data.links.length > 0 && (
                    <section className="wiki-section" style={{ marginTop: 40 }}>
                        <h2 className="wiki-section-title">Links</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {data.links.map((link: { label: string; url: string }) => (
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
                )}

                {/* Interactive section (client component) */}
                <WikiInteractive
                    slug={data.slug}
                    noDonateButton={data.noDonateButton}
                    donateAlternative={data.donateAlternative || undefined}
                    claimed={data.claimed}
                    claimedBy={data.claimedBy || undefined}
                />

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
                    {data.generatedBy
                        ? 'This story was written by Claude, funded by the shouldof.dev community.'
                        : 'This wiki was written by a human. No AI was involved.'}
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

function renderEmptyWikiPage(data: {
    slug: string;
    name: string;
    description: string | null;
    creatorName: string | null;
    npmUrl: string | null;
    repoUrl: string | null;
}) {
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
                <div className="wiki-header">
                    <div className="wiki-package-name">{data.name}</div>
                    <h1 className="wiki-title">{data.creatorName || data.name}</h1>
                    {data.description && (
                        <p className="wiki-creator-location">{data.description}</p>
                    )}
                </div>

                <section className="wiki-section" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                        Story coming soon
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
                        This package is on the graph, but its story hasn&apos;t been written yet.
                        <a href="/fund" style={{ color: 'var(--accent-violet-light)' }}>Fund the storyteller</a> to
                        unlock the next batch of AI-generated wikis.
                    </p>
                </section>

                {/* Interactive section (thank-you still works even without wiki) */}
                <WikiInteractive
                    slug={data.slug}
                    noDonateButton={false}
                    claimed={false}
                />

                <div
                    style={{
                        marginTop: 24,
                        display: 'flex',
                        gap: 12,
                        justifyContent: 'center',
                    }}
                >
                    {data.npmUrl && (
                        <a href={data.npmUrl} target="_blank" rel="noopener noreferrer" className="nav-link">
                            npm →
                        </a>
                    )}
                    {data.repoUrl && (
                        <a href={data.repoUrl} target="_blank" rel="noopener noreferrer" className="nav-link">
                            GitHub →
                        </a>
                    )}
                </div>
            </article>

            <footer className="site-footer">
                <p className="footer-text">
                    Built with <span className="footer-heart">♥</span> at Node Zero, Joinville, SC, Brazil
                </p>
            </footer>
        </>
    );
}
