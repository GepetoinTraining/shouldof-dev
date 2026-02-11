'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { IconBrandGithub, IconFocus2, IconX } from '@tabler/icons-react';
import GraphSection from '@/app/GraphSection';

export default function HeroSection() {
    const [diveMode, setDiveMode] = useState(false);

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
                <GraphSection interactive={diveMode} />
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

            {/* Dive Mode Controls — appears when exploring */}
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
                        onClick={() => setDiveMode(false)}
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
