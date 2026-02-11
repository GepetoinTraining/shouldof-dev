'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    IconBrandGithub, IconTrash, IconPackage, IconHeart,
    IconCoin, IconLoader2, IconPlus, IconLogout, IconArrowLeft,
} from '@tabler/icons-react';

interface ProjectData {
    id: number;
    name: string;
    repoFullName: string;
    repoUrl: string;
    description: string | null;
    tag: string;
    packageCount: number;
    createdAt: string;
}

interface ThankYouData {
    id: number;
    message: string;
    createdAt: string;
    packageName: string | null;
    packageSlug: string | null;
}

interface FundingData {
    id: number;
    amount: number;
    currency: string;
    createdAt: string;
}

interface ProfileData {
    user: {
        githubId: string;
        githubUsername: string;
        name: string | null;
        email: string | null;
        avatarUrl: string | null;
        createdAt?: string;
    };
    projects: ProjectData[];
    thankYous: ThankYouData[];
    funding: FundingData[];
    stats: {
        projectCount: number;
        thankYouCount: number;
        totalFunded: number;
    };
}

const TAG_LABELS: Record<string, string> = {
    edutech: '🎓 Edutech',
    fintech: '💰 Fintech',
    healthtech: '🏥 Healthtech',
    saas: '☁️ SaaS',
    tool: '🔧 Tool',
    game: '🎮 Game',
    blog: '📝 Blog',
    other: '📦 Other',
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }

    async function removeProject(projectId: number) {
        setRemoving(projectId);
        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
            if (res.ok) {
                setProfile(prev => prev ? {
                    ...prev,
                    projects: prev.projects.filter(p => p.id !== projectId),
                    stats: { ...prev.stats, projectCount: prev.stats.projectCount - 1 },
                } : null);
            }
        } catch {
            // silent
        } finally {
            setRemoving(null);
        }
    }

    // Not logged in
    if (status === 'unauthenticated') {
        return (
            <>
                <header className="site-header">
                    <Link href="/" className="site-logo">
                        <span className="logo-dot" />
                        shouldof.dev
                    </Link>
                </header>
                <div style={{ textAlign: 'center', paddingTop: 120, maxWidth: 480, margin: '0 auto' }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Your Profile</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                        Sign in with GitHub to see your connected projects,
                        wiki contributions, and funding history.
                    </p>
                    <button className="hero-cta" onClick={() => signIn('github', { callbackUrl: '/profile' })}>
                        <IconBrandGithub size={20} />
                        Sign in with GitHub
                    </button>
                </div>
            </>
        );
    }

    // Loading state
    if (loading || !profile) {
        return (
            <>
                <header className="site-header">
                    <Link href="/" className="site-logo">
                        <span className="logo-dot" />
                        shouldof.dev
                    </Link>
                </header>
                <div style={{ textAlign: 'center', paddingTop: 120 }}>
                    <IconLoader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-violet-light)" />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            </>
        );
    }

    const user = profile.user;
    const userSession = session?.user as any;

    return (
        <>
            <header className="site-header">
                <Link href="/" className="site-logo">
                    <span className="logo-dot" />
                    shouldof.dev
                </Link>
                <nav className="nav-links">
                    <Link href="/" className="nav-link">
                        <IconArrowLeft size={14} style={{ marginRight: 4 }} />
                        Back to Graph
                    </Link>
                </nav>
            </header>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* User Card */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    padding: 24,
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                    borderRadius: 16,
                    marginBottom: 40,
                }}>
                    {userSession?.image ? (
                        <img
                            src={userSession.image}
                            alt=""
                            width={64} height={64}
                            style={{ borderRadius: '50%', border: '2px solid rgba(124, 58, 237, 0.2)' }}
                        />
                    ) : (
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-violet), #6d28d9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, fontWeight: 700, color: 'white',
                        }}>
                            {(user.name || user.githubUsername || '?')[0].toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>
                            {user.name || user.githubUsername}
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
                            @{user.githubUsername}
                        </p>
                        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                📦 {profile.stats.projectCount} project{profile.stats.projectCount !== 1 ? 's' : ''}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                💜 {profile.stats.thankYouCount} thank you{profile.stats.thankYouCount !== 1 ? 's' : ''}
                            </span>
                            {profile.stats.totalFunded > 0 && (
                                <span style={{ color: 'var(--accent-emerald)' }}>
                                    💚 ${profile.stats.totalFunded.toFixed(2)} funded
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px',
                            background: 'rgba(244, 63, 94, 0.06)',
                            border: '1px solid rgba(244, 63, 94, 0.15)',
                            borderRadius: 10,
                            color: '#f43f5e',
                            fontSize: 13, fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <IconLogout size={14} />
                        Sign out
                    </button>
                </div>

                {/* Connected Projects */}
                <section style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                            <IconPackage size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                            Connected Projects
                        </h2>
                        <Link href="/connect" style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px',
                            background: 'rgba(124, 58, 237, 0.08)',
                            border: '1px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: 'var(--accent-violet-light)',
                            fontSize: 13, fontWeight: 600,
                        }}>
                            <IconPlus size={14} />
                            Add Project
                        </Link>
                    </div>

                    {profile.projects.length === 0 ? (
                        <div style={{
                            padding: 32, textAlign: 'center',
                            background: 'var(--bg-surface)',
                            border: '1px solid rgba(124, 58, 237, 0.06)',
                            borderRadius: 12,
                        }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                                No projects connected yet. Add one to see its dependency graph!
                            </p>
                            <Link href="/connect" className="hero-cta" style={{ display: 'inline-flex', fontSize: 14 }}>
                                <IconBrandGithub size={16} />
                                Connect a Project
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {profile.projects.map(proj => (
                                <div key={proj.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 18px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(124, 58, 237, 0.06)',
                                    borderRadius: 12,
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <a
                                                href={proj.repoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    fontWeight: 700, fontSize: 15,
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {proj.name}
                                            </a>
                                            <span style={{
                                                fontSize: 11, padding: '2px 8px',
                                                background: 'rgba(124, 58, 237, 0.08)',
                                                borderRadius: 6, color: 'var(--text-muted)',
                                            }}>
                                                {TAG_LABELS[proj.tag] || proj.tag}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {proj.packageCount} packages · {proj.repoFullName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeProject(proj.id)}
                                        disabled={removing === proj.id}
                                        title="Remove project"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '6px 10px',
                                            background: 'rgba(244, 63, 94, 0.06)',
                                            border: '1px solid rgba(244, 63, 94, 0.15)',
                                            borderRadius: 8,
                                            color: '#f43f5e',
                                            fontSize: 12, cursor: removing === proj.id ? 'wait' : 'pointer',
                                            opacity: removing === proj.id ? 0.5 : 1,
                                        }}
                                    >
                                        <IconTrash size={13} />
                                        {removing === proj.id ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Wiki Contributions */}
                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                        <IconHeart size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                        Thank You Messages
                    </h2>

                    {profile.thankYous.length === 0 ? (
                        <div style={{
                            padding: 24, textAlign: 'center',
                            background: 'var(--bg-surface)',
                            border: '1px solid rgba(124, 58, 237, 0.06)',
                            borderRadius: 12,
                        }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                No thank-you messages yet. Visit a wiki page to send gratitude!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {profile.thankYous.map(ty => (
                                <div key={ty.id} style={{
                                    padding: '14px 18px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(124, 58, 237, 0.06)',
                                    borderRadius: 12,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        {ty.packageSlug ? (
                                            <Link href={`/wiki/${ty.packageSlug}`} style={{
                                                fontWeight: 600, fontSize: 14,
                                                color: 'var(--accent-violet-light)',
                                                textDecoration: 'none',
                                            }}>
                                                {ty.packageName}
                                            </Link>
                                        ) : (
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>{ty.packageName}</span>
                                        )}
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {new Date(ty.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        &ldquo;{ty.message}&rdquo;
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Funding History */}
                <section>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                        <IconCoin size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                        Funding Contributions
                    </h2>

                    {profile.funding.length === 0 ? (
                        <div style={{
                            padding: 24, textAlign: 'center',
                            background: 'var(--bg-surface)',
                            border: '1px solid rgba(124, 58, 237, 0.06)',
                            borderRadius: 12,
                        }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
                                No contributions yet. Help fund the storyteller!
                            </p>
                            <Link href="/fund" style={{
                                color: 'var(--accent-violet-light)',
                                fontSize: 14, fontWeight: 600,
                                textDecoration: 'none',
                            }}>
                                Learn about funding →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {profile.funding.map(f => (
                                <div key={f.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '14px 18px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(124, 58, 237, 0.06)',
                                    borderRadius: 12,
                                }}>
                                    <span style={{
                                        fontWeight: 700, fontSize: 16,
                                        color: 'var(--accent-emerald)',
                                    }}>
                                        ${f.amount.toFixed(2)} {f.currency}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {new Date(f.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </>
    );
}
