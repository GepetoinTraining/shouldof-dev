'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FundingStats {
    balance: number;
    storiesGenerated: number;
    avgCostPerStory: number;
    totalFunded: number;
    totalSpent: number;
    storiesPerDollar: number;
}

export default function FundingWidget() {
    const [stats, setStats] = useState<FundingStats | null>(null);
    const [amount, setAmount] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch('/api/funding')
            .then((r) => r.json())
            .then(setStats)
            .catch(() => { });
    }, [success]);

    async function handleFund() {
        setSubmitting(true);
        try {
            const res = await fetch('/api/funding/contribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch {
            // silent
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(124, 58, 237, 0.12)',
                borderRadius: 16,
                padding: '28px 24px',
            }}
        >
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: stats && stats.balance > 0 ? 'var(--accent-emerald)' : '#f43f5e',
                    }}>
                        ${stats?.balance?.toFixed(2) ?? '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Pool Balance
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-violet-light)' }}>
                        {stats?.storiesGenerated ?? '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Stories Written
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                        ~${stats?.avgCostPerStory?.toFixed(3) ?? '0.030'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Per Story
                    </div>
                </div>
            </div>

            {/* Amount selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
                {[1, 5, 10, 25].map((a) => (
                    <button
                        key={a}
                        onClick={() => setAmount(a)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: amount === a ? '2px solid var(--accent-violet)' : '1px solid rgba(124, 58, 237, 0.15)',
                            background: amount === a ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                            color: amount === a ? 'var(--accent-violet-light)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        ${a}
                    </button>
                ))}
            </div>

            {/* Estimate */}
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                ${amount} → ~{Math.floor(amount / (stats?.avgCostPerStory || 0.03))} stories unlocked
            </p>

            {/* CTA */}
            {success ? (
                <div style={{
                    textAlign: 'center',
                    padding: '12px 0',
                    color: 'var(--accent-emerald)',
                    fontWeight: 600,
                    fontSize: 15,
                }}>
                    💜 Thank you! The storyteller is funded.
                </div>
            ) : (
                <button
                    onClick={handleFund}
                    disabled={submitting}
                    className="hero-cta"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        opacity: submitting ? 0.5 : 1,
                    }}
                >
                    {submitting ? 'Processing...' : `Fund $${amount} — Tell ${Math.floor(amount / (stats?.avgCostPerStory || 0.03))} Stories`}
                </button>
            )}

            {/* Link to full page if embedded */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link href="/fund" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline' }}>
                    Full transparency dashboard →
                </Link>
            </div>
        </div>
    );
}
