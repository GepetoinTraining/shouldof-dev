'use client';

import { useState } from 'react';
import { IconSend, IconHeart } from '@tabler/icons-react';

interface ThankYouFormProps {
    packageSlug: string;
    onSubmitted?: () => void;
}

export default function ThankYouForm({ packageSlug, onSubmitted }: ThankYouFormProps) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim() || !name.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/thank-you', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageSlug,
                    message: message.trim(),
                    authorName: name.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send');
            }

            setSubmitted(true);
            setMessage('');
            setName('');
            onSubmitted?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div
                style={{
                    padding: '20px 24px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 12,
                    textAlign: 'center',
                }}
            >
                <IconHeart size={24} color="var(--accent-emerald)" style={{ marginBottom: 8 }} />
                <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: 4 }}>
                    Thank you sent! 💜
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                    }}
                >
                    Send another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                }}
            />
            <textarea
                placeholder="Say thank you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                }}
            />
            {error && (
                <p style={{ color: '#f43f5e', fontSize: 13, margin: 0 }}>{error}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {message.length}/500 · No payment required
                </span>
                <button
                    type="submit"
                    disabled={submitting || !message.trim() || !name.trim()}
                    className="hero-cta"
                    style={{
                        padding: '8px 20px',
                        fontSize: 14,
                        opacity: submitting || !message.trim() || !name.trim() ? 0.5 : 1,
                    }}
                >
                    <IconSend size={14} />
                    {submitting ? 'Sending...' : 'Send'}
                </button>
            </div>
        </form>
    );
}
