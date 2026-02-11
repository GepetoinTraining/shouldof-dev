'use client';

import { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGithub, IconFocus2, IconX, IconBook, IconSparkles } from '@tabler/icons-react';
import GraphSection from '@/app/GraphSection';
import type { GraphNode } from '@/components/graph/ForceGraph';

export default function HeroSection() {
    const [diveMode, setDiveMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [generating, setGenerating] = useState(false);
    const [genMessage, setGenMessage] = useState('');
    const router = useRouter();

    const handleNodeClick = useCallback((node: GraphNode) => {
        if (!diveMode) return;
        setSelectedNode(node);
        setGenMessage('');
    }, [diveMode]);

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

    function exitDive() {
        setDiveMode(false);
        setSelectedNode(null);
        setGenMessage('');
    }

    return (
        <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            {/* Graph */}
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
                <GraphSection interactive={diveMode} onNodeClick={diveMode ? handleNodeClick : undefined} />
            </Suspense>

            {/* Hero overlay — fades out in dive mode */}
            <div
                className="hero-overlay"
                style={{
                    opacity: diveMode ? 0 : 1,
                    pointerEvents: diveMode ? 'none' : 'auto',
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
                        onClick={() => setDiveMode(true)}
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
            </div>

            {/* Node Action Panel — appears when a node is clicked in dive mode */}
            {diveMode && selectedNode && (
                <div
                    style={{
                        position: 'absolute',
                        top: 80,
                        right: 24,
                        width: 280,
                        padding: '20px',
                        background: 'rgba(5, 5, 20, 0.92)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        borderRadius: 14,
                        zIndex: 20,
                        animation: 'fadeIn 0.3s ease',
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={() => setSelectedNode(null)}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 4,
                        }}
                    >
                        <IconX size={16} />
                    </button>

                    {/* Package name */}
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

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                        {selectedNode.thankYouCount > 0 && <span>💜 {selectedNode.thankYouCount}</span>}
                        {selectedNode.hasWiki && <span>📖 Wiki</span>}
                        {!selectedNode.hasWiki && <span style={{ color: 'var(--accent-amber)' }}>⏳ No wiki yet</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedNode.hasWiki ? (
                            <button
                                onClick={() => router.push(`/wiki/${selectedNode.slug}`)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    background: 'linear-gradient(135deg, var(--accent-violet) 0%, #6d28d9 100%)',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    background: generating
                                        ? 'rgba(124, 58, 237, 0.2)'
                                        : 'linear-gradient(135deg, var(--accent-violet) 0%, #6d28d9 100%)',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: generating ? 'wait' : 'pointer',
                                    opacity: generating ? 0.7 : 1,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <IconSparkles size={16} />
                                {generating ? 'Writing story...' : 'Generate Wiki'}
                            </button>
                        )}
                    </div>

                    {/* Generation message */}
                    {genMessage && (
                        <p style={{
                            fontSize: 13,
                            marginTop: 10,
                            color: genMessage.startsWith('✨') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                            lineHeight: 1.5,
                        }}>
                            {genMessage}
                        </p>
                    )}
                </div>
            )}

            {/* Dive Mode Controls */}
            {diveMode && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        padding: '12px 20px',
                        background: 'rgba(5, 5, 20, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        borderRadius: 12,
                        zIndex: 20,
                        animation: 'fadeIn 0.4s ease',
                    }}
                >
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        🔍 Scroll to zoom · Drag to pan · Click a node for its story
                    </span>
                    <button
                        onClick={exitDive}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            borderRadius: 8,
                            color: '#f43f5e',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <IconX size={14} />
                        Exit
                    </button>
                </div>
            )}

            {/* Stats bar */}
            <div
                className="stats-bar"
                style={{
                    opacity: diveMode ? 0 : 1,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: diveMode ? 'none' : 'auto',
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
        </div>
    );
}
