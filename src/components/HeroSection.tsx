'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGithub, IconFocus2, IconX, IconBook, IconSparkles, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import GraphSection from '@/app/GraphSection';
import type { GraphNode } from '@/components/graph/ForceGraph';

export default function HeroSection() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [diveMode, setDiveMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [generating, setGenerating] = useState(false);
    const [genMessage, setGenMessage] = useState('');
    const router = useRouter();

    // Track scroll position → progress (0..1)
    useEffect(() => {
        if (diveMode) return; // Don't track scroll when locked in dive mode

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const threshold = window.innerHeight * 0.6;
            const progress = Math.min(scrollY / threshold, 1);
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [diveMode]);

    // Lock body scroll when in dive mode
    useEffect(() => {
        if (diveMode) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, [diveMode]);

    // "Explore" button → enter dive mode with animation
    function handleExploreClick() {
        setScrollProgress(1);
        setDiveMode(true);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    // Exit dive → return to hero
    function exitDive() {
        setDiveMode(false);
        setSelectedNode(null);
        setGenMessage('');
        setScrollProgress(0);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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

    // Derived values
    const heroOpacity = diveMode ? 0 : (1 - scrollProgress);
    const graphBlur = diveMode ? 0 : Math.max(0, 12 - scrollProgress * 12);
    const graphBrightness = diveMode ? 1 : (0.3 + scrollProgress * 0.7);
    const isInteractive = diveMode;

    return (
        <>
            {/* Scroll spacer — only visible when NOT in dive mode */}
            {!diveMode && <div style={{ height: '160vh' }} />}

            {/* Graph layer — fixed, behind hero, starts blurred */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1,
                    filter: `blur(${graphBlur}px) brightness(${graphBrightness})`,
                    transition: 'filter 0.6s ease',
                }}
            >
                <Suspense
                    fallback={
                        <div style={{
                            width: '100%', height: '100vh',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-deep)',
                        }}>
                            <div className="logo-dot" style={{ width: 16, height: 16 }} />
                        </div>
                    }
                >
                    <GraphSection interactive={isInteractive} onNodeClick={isInteractive ? handleNodeClick : undefined} />
                </Suspense>
            </div>

            {/* Hero overlay — fixed, fades as you scroll or when dive mode */}
            <div
                className="hero-overlay"
                style={{
                    position: 'fixed',
                    zIndex: 10,
                    opacity: heroOpacity,
                    pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto',
                    transition: 'opacity 0.5s ease',
                }}
            >
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
                        onClick={handleExploreClick}
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

                {/* Scroll hint */}
                <div style={{
                    position: 'absolute',
                    bottom: 100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    opacity: 0.4,
                    animation: 'float 2s ease-in-out infinite',
                }}>
                    <IconChevronDown size={20} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>scroll to explore</span>
                </div>
            </div>

            {/* Stats bar — fades with hero */}
            <div
                className="stats-bar"
                style={{
                    position: 'fixed',
                    opacity: heroOpacity,
                    pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto',
                    transition: 'opacity 0.4s ease',
                }}
            >
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

            {/* ─── DIVE MODE UI ─────────────────────────────────── */}

            {/* Node Action Panel */}
            {diveMode && selectedNode && (
                <div
                    style={{
                        position: 'fixed',
                        top: 80, right: 24, width: 280,
                        padding: '20px',
                        background: 'rgba(5, 5, 20, 0.92)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        borderRadius: 14, zIndex: 30,
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

            {/* Dive Mode Bottom Bar */}
            {diveMode && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 32, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: 12, alignItems: 'center',
                        padding: '12px 20px',
                        background: 'rgba(5, 5, 20, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        borderRadius: 12, zIndex: 30,
                        animation: 'fadeIn 0.4s ease',
                    }}
                >
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        🔍 Scroll to zoom · Drag to pan · Click a node
                    </span>
                    <button
                        onClick={exitDive}
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
            )}

            {/* Section Navigation Arrows — always visible */}
            {!diveMode && (
                <div style={{
                    position: 'fixed',
                    right: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    zIndex: 20,
                }}>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        title="Back to top"
                        style={{
                            width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(5, 5, 20, 0.7)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 10, color: 'var(--text-muted)',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <IconChevronUp size={18} />
                    </button>
                    <button
                        onClick={handleExploreClick}
                        title="Dive into graph"
                        style={{
                            width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(5, 5, 20, 0.7)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 10, color: 'var(--text-muted)',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <IconChevronDown size={18} />
                    </button>
                </div>
            )}

            {/* Back to Top arrow in dive mode */}
            {diveMode && (
                <button
                    onClick={exitDive}
                    title="Back to hero"
                    style={{
                        position: 'fixed',
                        right: 24, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 40, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(5, 5, 20, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(124, 58, 237, 0.15)',
                        borderRadius: 10, color: 'var(--text-muted)',
                        cursor: 'pointer', zIndex: 30,
                    }}
                >
                    <IconChevronUp size={18} />
                </button>
            )}
        </>
    );
}
