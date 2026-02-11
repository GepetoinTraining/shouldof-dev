'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    IconBrandGithub,
    IconSearch,
    IconPackage,
    IconCheck,
    IconLoader2,
    IconArrowLeft,
} from '@tabler/icons-react';
import type { GitHubRepo } from '@/lib/github';

const TAGS = [
    { value: 'edutech', label: '🎓 Edutech' },
    { value: 'fintech', label: '💰 Fintech' },
    { value: 'healthtech', label: '🏥 Healthtech' },
    { value: 'saas', label: '☁️ SaaS' },
    { value: 'tool', label: '🔧 Tool' },
    { value: 'game', label: '🎮 Game' },
    { value: 'blog', label: '📝 Blog' },
    { value: 'other', label: '📦 Other' },
];

type Step = 'auth' | 'select-repo' | 'select-tag' | 'processing' | 'done';

export default function ConnectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [step, setStep] = useState<Step>('auth');
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
    const [search, setSearch] = useState('');
    const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
    const [selectedTag, setSelectedTag] = useState('other');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ name: string; packageCount: number } | null>(null);

    // Determine initial step based on auth
    useEffect(() => {
        if (status === 'authenticated') {
            setStep('select-repo');
            fetchRepos();
        } else if (status === 'unauthenticated') {
            setStep('auth');
        }
    }, [status]);

    // Filter repos by search
    useEffect(() => {
        if (!search) {
            setFilteredRepos(repos);
        } else {
            setFilteredRepos(
                repos.filter((r) =>
                    r.name.toLowerCase().includes(search.toLowerCase()) ||
                    r.description?.toLowerCase().includes(search.toLowerCase())
                ),
            );
        }
    }, [search, repos]);

    async function fetchRepos() {
        setLoading(true);
        try {
            const res = await fetch('/api/repos');
            if (!res.ok) throw new Error('Failed to fetch repos');
            const data = await res.json();
            setRepos(data);
            setFilteredRepos(data);
        } catch {
            setError('Could not load your repositories. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleConnect() {
        if (!selectedRepo) return;
        setStep('processing');
        setError(null);

        try {
            const res = await fetch('/api/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: selectedRepo.full_name,
                    repoUrl: selectedRepo.html_url,
                    repoName: selectedRepo.name,
                    repoDescription: selectedRepo.description,
                    tag: selectedTag,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect project');
            }

            setResult(data.project);
            setStep('done');
        } catch (err: any) {
            setError(err.message);
            setStep('select-tag');
        }
    }

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

            <div className="connect-page">
                {/* Step: Auth */}
                {step === 'auth' && (
                    <div style={{ textAlign: 'center', paddingTop: 80 }}>
                        <h1
                            style={{
                                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                                fontWeight: 800,
                                marginBottom: 16,
                            }}
                        >
                            Connect Your Project
                        </h1>
                        <p
                            style={{
                                color: 'var(--text-secondary)',
                                fontSize: 16,
                                marginBottom: 32,
                                lineHeight: 1.6,
                            }}
                        >
                            Sign in with GitHub to add your project to the gratitude graph.
                            <br />
                            We&apos;ll read your dependencies and give credit to every human behind them.
                        </p>
                        <button
                            className="hero-cta"
                            onClick={() => signIn('github', { callbackUrl: '/connect' })}
                        >
                            <IconBrandGithub size={20} />
                            Sign in with GitHub
                        </button>
                    </div>
                )}

                {/* Step: Select Repo */}
                {step === 'select-repo' && (
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                            Select a Repository
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24 }}>
                            Choose the project you want to add to the graph.
                        </p>

                        {/* Search */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 16px',
                                background: 'var(--bg-surface)',
                                borderRadius: 10,
                                border: '1px solid rgba(124, 58, 237, 0.1)',
                                marginBottom: 16,
                            }}
                        >
                            <IconSearch size={16} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: 14,
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <IconLoader2
                                    size={24}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                    color="var(--accent-violet-light)"
                                />
                                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : (
                            <div className="repo-list">
                                {filteredRepos.map((repo) => (
                                    <div
                                        key={repo.id}
                                        className={`repo-card ${selectedRepo?.id === repo.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedRepo(repo);
                                            setStep('select-tag');
                                        }}
                                    >
                                        <div>
                                            <div className="repo-name">
                                                <IconPackage size={14} style={{ marginRight: 6 }} />
                                                {repo.name}
                                            </div>
                                            {repo.description && (
                                                <div className="repo-description">{repo.description}</div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {repo.language || ''}
                                        </div>
                                    </div>
                                ))}

                                {filteredRepos.length === 0 && !loading && (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
                                        No repositories found with a package.json
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step: Select Tag */}
                {step === 'select-tag' && selectedRepo && (
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                            Tag Your Project
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>
                            <strong>{selectedRepo.name}</strong> — What category best describes it?
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                            This helps discover patterns like &quot;89% of edutech projects use React&quot;
                        </p>

                        <div className="tag-grid">
                            {TAGS.map((tag) => (
                                <div
                                    key={tag.value}
                                    className={`tag-chip ${selectedTag === tag.value ? 'active' : ''}`}
                                    onClick={() => setSelectedTag(tag.value)}
                                >
                                    {tag.label}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: '12px 16px',
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    border: '1px solid rgba(244, 63, 94, 0.3)',
                                    borderRadius: 10,
                                    color: '#f43f5e',
                                    fontSize: 14,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                            <button
                                className="nav-link"
                                onClick={() => setStep('select-repo')}
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(124, 58, 237, 0.2)',
                                    borderRadius: 10,
                                    padding: '12px 20px',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                className="hero-cta"
                                onClick={handleConnect}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <IconBrandGithub size={18} />
                                Connect {selectedRepo.name}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div style={{ textAlign: 'center', paddingTop: 80 }}>
                        <IconLoader2
                            size={40}
                            style={{ animation: 'spin 1s linear infinite', marginBottom: 24 }}
                            color="var(--accent-violet-light)"
                        />
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            Reading your dependencies...
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                            Finding the humans behind your code.
                        </p>
                    </div>
                )}

                {/* Step: Done */}
                {step === 'done' && result && (
                    <div style={{ textAlign: 'center', paddingTop: 80 }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '2px solid var(--accent-emerald)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}
                        >
                            <IconCheck size={32} color="var(--accent-emerald)" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                            {result.name} is on the graph!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 8 }}>
                            {result.packageCount} packages found. {result.packageCount} humans credited.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
                            The web just grew. Every developer behind your dependencies is now visible.
                        </p>
                        <Link
                            href="/"
                            className="hero-cta"
                        >
                            See the Graph →
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
