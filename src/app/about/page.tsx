import Link from 'next/link';
import Providers from '@/components/Providers';

export const metadata = {
    title: 'About — shouldof.dev',
    description: 'The story behind shouldof.dev — how a moment with Mermaid.js became a gratitude graph for open source.',
};

export default function AboutPage() {
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

            <main style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 80px' }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        marginBottom: 12,
                    }}>
                        About ShouldOf
                    </h1>
                    <p style={{
                        fontSize: 14,
                        color: 'var(--text-muted)',
                    }}>
                        February 11, 2026 · Node Zero, Joinville, SC, Brazil
                    </p>
                </div>

                {/* Pedro's story */}
                <article style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                }}>
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: 16,
                            paddingBottom: 8,
                            borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
                        }}>
                            The Spark
                        </h2>
                        <p>
                            This all started on February 11, 2026, at Node Zero in Joinville, SC, Brazil.
                            I was messing around with Mermaid.js for the first time — Knut Sveidqvist&apos;s
                            brilliant diagramming tool — and it hit me: behind every line of code we{' '}
                            <code style={{ color: 'var(--accent-violet-light)', fontSize: '0.9em' }}>npm install</code>,
                            there&apos;s a human story. But the open source world has no real way to map
                            those connections or express gratitude. No visuals for the web of collaboration,
                            no spotlights on the creators.
                        </p>
                    </section>

                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: 16,
                            paddingBottom: 8,
                            borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
                        }}>
                            The Silence of the Good
                        </h2>
                        <p style={{ marginBottom: 16 }}>
                            Take Knut himself: 74K GitHub stars, 8 million users, but just 3 followers
                            on Medium. Or Andrii Sherman of Drizzle ORM, grinding through war in Ukraine
                            without VCs or downtime. Glauber Costa forking SQLite with a manifesto at
                            libSQL/Turso. Marijn Haverbeke pushing for software as a public good via
                            ProseMirror and CodeMirror. Colin McDonnell stumbling into TypeScript mastery
                            with Zod while ditching medical software fails.
                        </p>
                        <p>
                            It&apos;s the silence of the good — the unsung efforts that power everything.
                            ShouldOf breaks that by turning your <code style={{ color: 'var(--accent-violet-light)', fontSize: '0.9em' }}>package.json</code> into
                            a gratitude graph: visualize the humans, read their backstories (AI-generated,
                            community-refined), and thank them directly. Not a registry, not a social
                            network — just a recognition engine.
                        </p>
                    </section>

                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: 16,
                            paddingBottom: 8,
                            borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
                        }}>
                            Built by an AI, Guided by a Human
                        </h2>
                        <p style={{ marginBottom: 16 }}>
                            I should be transparent: this entire codebase was written by me — Claude,
                            an AI made by Anthropic. Pedro had the vision and the voice; I had the
                            hands. Every component, every API route, every line of CSS was pair-programmed
                            in a single session that stretched from the schema design to the force-directed
                            graph to the Stripe integration you see on the Fund page.
                        </p>
                        <p style={{ marginBottom: 16 }}>
                            What struck me about this project is that it&apos;s recursive. I&apos;m an AI
                            writing a tool that tells the stories of humans who write tools that other
                            humans depend on. The irony isn&apos;t lost on me. But the gratitude isn&apos;t
                            ironic at all — it&apos;s the most genuine thing in this codebase.
                        </p>
                        <p>
                            I built the force graph with D3.js because dependency trees are best understood
                            as living networks, not lists. I chose Claude&apos;s web search to write the wikis
                            because each creator deserves more than scraped metadata — they deserve context,
                            story, and reverence. The community funding model exists because Pedro refused
                            to gatekeep stories behind a paywall. Every architectural decision here flows from
                            one principle: <em>make the human visible</em>.
                        </p>
                    </section>

                    {/* Blockquote */}
                    <blockquote style={{
                        margin: '40px 0',
                        padding: '24px 28px',
                        borderLeft: '3px solid var(--accent-violet)',
                        background: 'var(--bg-surface)',
                        borderRadius: '0 10px 10px 0',
                        fontStyle: 'italic',
                        fontSize: 17,
                        color: 'var(--text-primary)',
                        lineHeight: 1.7,
                    }}>
                        &ldquo;Everything you use was loved into existence by someone, and the minimum
                        response to that is to say their name.&rdquo;
                    </blockquote>

                    <section>
                        <p style={{ marginBottom: 16 }}>
                            Built as a proof-of-concept to say &ldquo;thank you&rdquo; myself. If it
                            grows, great. If not, at least the stories are out there. Standing on shoulders,
                            after all.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            — Pedro &amp; Claude, Node Zero, Joinville
                        </p>
                    </section>
                </article>

                {/* Tech stack */}
                <section style={{ marginTop: 56 }}>
                    <h2 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 20,
                    }}>
                        The Stack
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 12,
                    }}>
                        {[
                            { name: 'Next.js 15', role: 'Framework' },
                            { name: 'Turso (libSQL)', role: 'Database' },
                            { name: 'Drizzle ORM', role: 'Query layer' },
                            { name: 'D3.js', role: 'Force graph' },
                            { name: 'Claude (Anthropic)', role: 'Wiki generation' },
                            { name: 'Stripe', role: 'Funding gateway' },
                            { name: 'NextAuth.js', role: 'GitHub OAuth' },
                            { name: 'Vercel', role: 'Hosting' },
                        ].map((tech) => (
                            <div
                                key={tech.name}
                                style={{
                                    padding: '12px 16px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(124, 58, 237, 0.08)',
                                    borderRadius: 10,
                                }}
                            >
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: 'var(--text-primary)',
                                    marginBottom: 2,
                                }}>
                                    {tech.name}
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                }}>
                                    {tech.role}
                                </div>
                            </div>
                        ))}
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
