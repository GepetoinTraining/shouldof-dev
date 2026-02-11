'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGithub, IconFocus2, IconX, IconBook, IconSparkles } from '@tabler/icons-react';
import GraphSection from '@/app/GraphSection';
import type { GraphNode } from '@/components/graph/ForceGraph';

export default function HeroSection() {
    const [graphOpen, setGraphOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [generating, setGenerating] = useState(false);
    const [genMessage, setGenMessage] = useState('');
    const [stats, setStats] = useState({ stories: 0, projects: 0, thankYous: 0 });
    const router = useRouter();

    // Fetch live stats on mount
    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => { /* silent */ });
    }, []);

    // Lock body scroll when graph overlay is open
    useEffect(() => {
        if (graphOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [graphOpen]);

    function openGraph() {
        setGraphOpen(true);
        setSelectedNode(null);
        setGenMessage('');
    }

    function closeGraph() {
        setGraphOpen(false);
        setSelectedNode(null);
        setGenMessage('');
    }

    const handleNodeClick = useCallback((node: GraphNode) => {
        setSelectedNode(node);
        setGenMessage('');
    }, []);

    async function handleGenerate() {
        if (!selectedNode) return;
        setGenerating(true);
        setGenMessage('');
        try {
            const res = await fetch('/api/generate-wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: selectedNode.slug }),
            });
            const data = await res.json();
            if (res.ok) {
                setGenMessage('✨ Wiki generated! Redirecting...');
                setTimeout(() => router.push(`/wiki/${selectedNode.slug}`), 1500);
            } else {
                setGenMessage(data.error || 'Generation failed');
            }
        } catch {
            setGenMessage('Network error — try again');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <>
            {/* ───────────────────── HERO SECTION ───────────────────── */}
            <section className="hero-overlay">
                <h1 className="hero-tagline">Every npm install is a person.</h1>
                <p className="hero-subtitle">
                    See the humans behind your code. Connect your project. Watch the web of
                    gratitude grow.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/connect" className="hero-cta">
                        <IconBrandGithub size={20} />
                        Connect Your GitHub
                    </Link>
                    <button
                        onClick={openGraph}
                        className="hero-cta"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(124, 58, 237, 0.3)',
                        }}
                    >
                        <IconFocus2 size={20} />
                        Explore the Graph
                    </button>
                </div>
            </section>

            {/* ───────────── DECORATIVE GRAPH (in-flow, non-interactive) ───────── */}
            <section style={{
                position: 'relative',
                height: '80vh',
                overflow: 'hidden',
                filter: 'blur(4px) brightness(0.3)',
                pointerEvents: 'none',
            }}>
                <Suspense
                    fallback={
                        <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-deep)',
                        }}>
                            <div className="logo-dot" style={{ width: 16, height: 16 }} />
                        </div>
                    }
                >
                    <GraphSection interactive={false} />
                </Suspense>
            </section>

            {/* ───────────── STATS BAR ─────────────────────────────── */}
            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-value">{stats.stories}</div>
                    <div className="stat-label">Stories</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.projects}</div>
                    <div className="stat-label">Projects</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.thankYous}</div>
                    <div className="stat-label">Thank Yous</div>
                </div>
            </div>

            {/* ══════════ GRAPH OVERLAY (fullscreen, interactive) ══════════ */}
            {graphOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    background: 'var(--bg-deep)',
                    animation: 'graphFadeIn 0.3s ease',
                }}>
                    {/* Interactive graph fills the viewport */}
                    <Suspense
                        fallback={
                            <div style={{
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-deep)',
                            }}>
                                <div className="logo-dot" style={{ width: 16, height: 16 }} />
                            </div>
                        }
                    >
                        <GraphSection interactive={true} onNodeClick={handleNodeClick} />
                    </Suspense>

                    {/* ─── Node Action Panel ────────────────────────── */}
                    {selectedNode && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 80, right: 24, width: 280,
                                padding: '20px',
                                background: 'rgba(5, 5, 20, 0.92)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(124, 58, 237, 0.25)',
                                borderRadius: 14, zIndex: 110,
                                animation: 'fadeIn 0.3s ease',
                            }}
                        >
                            <button
                                onClick={() => setSelectedNode(null)}
                                style={{
                                    position: 'absolute', top: 12, right: 12,
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    cursor: 'pointer', padding: 4,
                                }}
                            >
                                <IconX size={16} />
                            </button>

                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-violet-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                                {selectedNode.type}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                                {selectedNode.name}
                            </h3>
                            {selectedNode.creatorName && (
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                    by {selectedNode.creatorName}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                {selectedNode.thankYouCount > 0 && <span>💜 {selectedNode.thankYouCount}</span>}
                                {selectedNode.hasWiki && <span>📖 Wiki</span>}
                                {!selectedNode.hasWiki && <span style={{ color: 'var(--accent-amber)' }}>⏳ No wiki yet</span>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {selectedNode.hasWiki ? (
                                    <button
                                        onClick={() => router.push(`/wiki/${selectedNode.slug}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 16px',
                                            background: 'linear-gradient(135deg, var(--accent-violet) 0%, #6d28d9 100%)',
                                            border: 'none', borderRadius: 10, color: 'white',
                                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        <IconBook size={16} />
                                        Read Wiki
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 16px',
                                            background: generating ? 'rgba(124, 58, 237, 0.2)' : 'linear-gradient(135deg, var(--accent-violet) 0%, #6d28d9 100%)',
                                            border: 'none', borderRadius: 10, color: 'white',
                                            fontSize: 14, fontWeight: 600,
                                            cursor: generating ? 'wait' : 'pointer',
                                            opacity: generating ? 0.7 : 1,
                                        }}
                                    >
                                        <IconSparkles size={16} />
                                        {generating ? 'Writing story...' : 'Generate Wiki'}
                                    </button>
                                )}
                            </div>

                            {genMessage && (
                                <p style={{
                                    fontSize: 13, marginTop: 10, lineHeight: 1.5,
                                    color: genMessage.startsWith('✨') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                                }}>
                                    {genMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ─── Bottom Control Bar ──────────────────────── */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 32, left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex', gap: 12, alignItems: 'center',
                            padding: '12px 20px',
                            background: 'rgba(5, 5, 20, 0.85)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(124, 58, 237, 0.2)',
                            borderRadius: 12, zIndex: 110,
                            animation: 'fadeIn 0.4s ease',
                        }}
                    >
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            🔍 Scroll to zoom · Drag to pan · Click a node
                        </span>
                        <button
                            onClick={closeGraph}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px',
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                borderRadius: 8, color: '#f43f5e',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <IconX size={14} />
                            Exit
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
